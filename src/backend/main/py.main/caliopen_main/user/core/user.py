# -*- coding: utf-8 -*-
"""Caliopen user related core classes."""

from __future__ import absolute_import, print_function, unicode_literals
from datetime import datetime
import bcrypt
import logging
import uuid

from elasticsearch import Elasticsearch
import zxcvbn
from validate_email import validate_email

from caliopen_storage.config import Configuration
from caliopen_storage.exception import NotFound, CredentialException
from ..store import (User as ModelUser,
                     UserName as ModelUserName,
                     IndexUser,
                     Counter as ModelCounter,
                     UserTag as ModelUserTag,
                     FilterRule as ModelFilterRule,
                     ReservedName as ModelReservedName
                     )

from caliopen_storage.core import BaseCore, BaseUserCore, core_registry
from .contact import Contact as CoreContact
from caliopen_main.objects.contact import Contact, Email
from caliopen_main.user.helpers import validators

log = logging.getLogger(__name__)


class Counter(BaseCore):

    """
    Counter core object.

    Store all counters related to an user
    """

    _model_class = ModelCounter
    _pkey_name = 'user_id'


class Tag(BaseUserCore):

    """Tag core object."""

    _model_class = ModelUserTag
    _pkey_name = 'tag_id'


class FilterRule(BaseUserCore):

    """Filter rule core class."""

    _model_class = ModelFilterRule
    _pkey_name = 'rule_id'

    @classmethod
    def create(cls, user, rule):
        """Create a new filtering rule."""
        rule.validate()
        # XXX : expr value is evil
        o = super(FilterRule, cls).create(user_id=user.user_id,
                                          rule_id=user.new_rule_id(),
                                          date_insert=datetime.utcnow(),
                                          name=rule.name,
                                          filter_expr=rule.expr,
                                          position=rule.position,
                                          stop_condition=rule.stop_condition,
                                          tags=rule.tags)
        return o

    def eval(self, message):
        """
        Evaluate if this rule apply to the given message.

        evaluation return a list of TAGS to add or nothing
        stop condition if set and if result is empty or not
        and match this stop condition, processing of rules
        on this message stop.

        """
        # XXXX WARN WARN WARN WARN WARN WARN WARN WARN
        #
        # This is a REALLY BASIC filtering concept with no
        # security consideration abount what is evaluated !!!!
        #
        # XXXX WARN WARN WARN WARN WARN WARN WARN WARN

        res = eval(self.filter_expr)
        if self.stop_condition is not None:
            if self.stop_condition and res:
                return self.tags, True
            if not self.stop_condition and not res:
                return self.tags, True
        if res:
            return self.tags, False
        return [], False


class ReservedName(BaseCore):

    """Reserved name core object."""

    _model_class = ModelReservedName
    _pkey_name = 'name'


class UserName(BaseCore):

    """User name core object."""

    _model_class = ModelUserName
    _pkey_name = 'name'


class User(BaseCore):

    """User core object."""

    _model_class = ModelUser
    _pkey_name = 'user_id'
    _index_class = IndexUser

    @classmethod
    def create(cls, new_user):
        """Create a new user.

        # 1.check username regex
        # 2.check username is not in reserved_name table
        # 3.check recovery email validity (TODO : check if email is not within the current Caliopen's instance)
        # 4.check username availability
        # 5.add username to user cassa user_name table (to block the availability)
        # 6.check password strength (and regex?)
        # then
        #      create user and linked contact
        """

        def rollback_username_storage(username):
            UserName.get(username).delete()

        # 1.
        try:
            validators.is_valid_username(new_user.name)
        except SyntaxError:
            raise ValueError("Malformed username")

        # 2.
        try:
            ReservedName.get(new_user.name)
            raise ValueError('Reserved user name')
        except NotFound:
            pass

        user_id = uuid.uuid4()
        # 3.
        if not new_user.recovery_email:
            raise ValueError("Missing recovery email")
        if not validate_email(new_user.recovery_email):
            raise ValueError("Invalid recovery email address")

        # 4. & 5.
        if User.is_username_available(new_user.name.lower()):
            # save username immediately to prevent concurrent creation
            UserName.create(name=new_user.name.lower(), user_id=user_id)
            # NB : need to rollback this username creation if the below User creation failed for any reason
        else:
            raise ValueError("Username already exist")

        # 6.
        try:
            user_inputs = [new_user.name.encode("utf-8"), new_user.recovery_email.encode("utf-8")]
            password_strength = zxcvbn.password_strength(new_user.password, user_inputs=user_inputs)  # TODO: add contact inputs if any
            privacy_features = {"password_strength": str(password_strength["score"])}
            new_user.password = bcrypt.hashpw(new_user.password.encode('utf-8'), bcrypt.gensalt())
        except Exception as exc:
            log.exception(exc)
            rollback_username_storage(new_user.name)
            raise exc

        try:
            new_user.validate()  # schematic model validation
        except Exception as exc:
            rollback_username_storage(new_user.name)
            log.info("schematics validation error: {}".format(exc))
            raise ValueError("new user malformed")

        try:
            core = super(User, cls).create(user_id=user_id,
                                           name=new_user.name,
                                           password=new_user.password,
                                           recovery_email=new_user.recovery_email,
                                           params=new_user.params,
                                           date_insert=datetime.utcnow(),
                                           privacy_features=privacy_features
                                           )
        except Exception as exc:
            log.info(exc)
            rollback_username_storage(new_user.name)
            raise exc

        # **** operations below do not raise fatal error and rollback **** #
        # Setup index
        core._setup_user_index()

        # Create counters
        Counter.create(user_id=core.user_id)
        core.setup_system_tags()

        # save and index linked contact
        if new_user.contact:
            contact = Contact(user_id=user_id, **new_user.contact.serialize())
            contact.contact_id = uuid.uuid4()

            for email in contact.emails:
                if email.address is not None and validate_email(email.address):
                    email.email_id = uuid.uuid4()

            try:
                contact.marshall_db()
                contact.save_db()
            except Exception as exc:
                log.info("save_db error : {}".format(exc))

            contact.marshall_index()
            contact.save_index()
            # XXX should use core proxy, not directly model attribute
            core.model.contact_id = contact.contact_id

        core.save()

        return core

    @classmethod
    def by_name(cls, name):
        """Get user by name."""
        uname = UserName.get(name.lower())
        return cls.get(uname.user_id)

    @classmethod
    def is_username_available(cls, username):
        """ returns true or false if username has been found in store's user_name table"""
        try:
            UserName.get(username.lower())
            return False
        except NotFound:
            return True

    @classmethod
    def authenticate(cls, user_name, password):
        """Authenticate an user."""
        try:
            user = cls.by_name(user_name)
        except NotFound:
            raise CredentialException('Invalid user')
        # XXX : decode unicode not this way
        if bcrypt.hashpw(str(password.encode('utf-8')),
                         str(user.password)) == user.password:
            return user
        raise CredentialException('Invalid credentials')

    def _setup_user_index(self):
        """Create user index and setup mappings."""
        url = Configuration('global').get('elasticsearch.url')
        client = Elasticsearch(url)
        log.debug('Creating index for user {}'.format(self.user_id))
        if not client.indices.exists(self.user_id):
            client.indices.create(self.user_id)
        else:
            log.warn('Index already exist {}'.format(self.user_id))

        for name, kls in core_registry.items():
            if kls._model_class._index_class and \
               hasattr(kls._model_class, 'user_id'):
                idx_kls = kls._model_class._index_class()
                log.debug('Init index for {}'.format(idx_kls))
                if hasattr(idx_kls, 'create_mapping'):
                    log.info('Create index {} mapping for doc_type {}'.
                             format(self.user_id, idx_kls.doc_type))
                    idx_kls.create_mapping(self.user_id)

    def setup_system_tags(self):
        # Create system tags
        default_tags = Configuration('global').get('system.default_tags')
        for tag in default_tags:
            tag['type'] = 'system'
            tag['date_insert'] = datetime.utcnow()
            Tag.create(self, **tag)

    def new_message_id(self):
        """Create a new message_id from ``Counter``."""
        counter = Counter.get(self.user_id)
        # XXX : MUST be handled by core object correctly
        counter.model.message_id += 1
        counter.save()
        return counter.message_id

    def new_thread_id(self):
        """Create a new thread_id from ``Counter``."""
        counter = Counter.get(self.user_id)
        # XXX : MUST be handled by core object correctly
        counter.model.thread_id += 1
        counter.save()
        return counter.thread_id

    def new_rule_id(self):
        """Create a new rule_id from ``counter``."""
        counter = Counter.get(self.user_id)
        counter.model.rule_id += 1
        counter.save()
        return counter.rule_id

    def get_thread_id(self, external_id):
        # XXX : lookup external thread_id to internal one
        return self.new_thread_id()

    @property
    def contact(self):
        """User is a contact."""
        return CoreContact.get(self, self.contact_id)

    @property
    def tags(self):
        """Tag objects related to an user"""
        objs = Tag._model_class.filter(user_id=self.user_id)
        return [Tag(x) for x in objs]

    @property
    def rules(self):
        """Filtering rules associated to an user, sorted by position."""
        objs = FilterRule._model_class.filter(user_id=self.user_id)
        cores = [FilterRule(x) for x in objs]
        return sorted(cores, key=lambda x: x.position)
