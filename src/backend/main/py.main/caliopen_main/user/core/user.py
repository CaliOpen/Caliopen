# -*- coding: utf-8 -*-
"""Caliopen user related core classes."""

from __future__ import absolute_import, print_function, unicode_literals
from datetime import datetime
import bcrypt
import logging

from elasticsearch import Elasticsearch

from caliopen_storage.config import Configuration
from caliopen_storage.exception import NotFound, CredentialException
from ..store.user import (User as ModelUser,
                          UserName as ModelUserName,
                          IndexUser,
                          Counter as ModelCounter,
                          Tag as ModelTag,
                          FilterRule as ModelFilterRule,
                          ReservedName as ModelReservedName,
                          LocalIdentity as ModelLocalIdentity)

from caliopen_storage.core import BaseCore, BaseUserCore, core_registry
from .contact import Contact

log = logging.getLogger(__name__)


class LocalIdentity(BaseCore):

    """User local identity core class."""

    _model_class = ModelLocalIdentity
    _pkey_name = 'address'


class Counter(BaseCore):

    """
    Counter core object.

    Store all counters related to an user
    """

    _model_class = ModelCounter
    _pkey_name = 'user_id'


class Tag(BaseUserCore):

    """Tag core object."""

    _model_class = ModelTag
    _pkey_name = 'label'


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
    def create(cls, user):
        """Create a new user."""
        user.validate()
        user.password = bcrypt.hashpw(user.password.encode('utf-8'),
                                      bcrypt.gensalt())
        try:
            ReservedName.get(user.name)
            raise ValueError('Reserved user name')
        except NotFound:
            pass
        try:
            UserName.get(user.name.lower())
            raise Exception('User %s already exist' % user.name)
        except NotFound:
            pass
        core = super(User, cls).create(name=user.name,
                                       password=user.password,
                                       params=user.params,
                                       date_insert=datetime.utcnow())
        # Setup index
        core._setup_user_index()

        # Ensure unicity
        UserName.create(name=user.name.lower(), user_id=core.user_id)
        if user.contact:
            contact = Contact.create(user=core, contact=user.contact)
            # XXX should use core proxy, not directly model attribute
            core.model.contact_id = contact.contact_id
            core.save()
        # Create counters
        Counter.create(user_id=core.user_id)
        # Create default tags
        default_tags = Configuration('global').get('system.default_tags')
        for tag in default_tags:
            Tag.create(core, **tag)

        # Add a default local identity on a default configured domain
        default_domain = Configuration('global').get('default_domain')
        default_local_id = '{}@{}'.format(core.name, default_domain)
        if not core.add_local_identity(default_local_id):
            log.warn('Impossible to create default local identity {}'.
                     format(default_local_id))

        return core

    @classmethod
    def by_name(cls, name):
        """Get user by name."""
        uname = UserName.get(name.lower())
        return cls.get(uname.user_id)

    @classmethod
    def by_local_identity(cls, address):
        """Get a user by one of its local identity."""
        identity = LocalIdentity.get(address.lower())
        return cls.get(identity.user_id)

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
        return Contact.get(self, self.contact_id)

    @property
    def tags(self):
        """Tag objects realted to an user"""
        objs = Tag._model_class.filter(user_id=self.user_id)
        return [Tag(x) for x in objs]

    @property
    def rules(self):
        """Filtering rules associated to an user, sorted by position."""
        objs = FilterRule._model_class.filter(user_id=self.user_id)
        cores = [FilterRule(x) for x in objs]
        return sorted(cores, key=lambda x: x.position)

    def add_local_identity(self, address):
        """
        Add a local identity to an user.

        return: True if success, False otherwise
        rtype: bool
        """

        formatted = address.lower()
        try:
            identity = LocalIdentity.get(formatted)
            if identity.user_id == self.user_id:
                if identity.address in self.local_identities:
                    # Already in local identities
                    return True
            raise Exception('Inconsistent local identity {}'.format(address))
        except NotFound:
            identity = LocalIdentity.create(address=formatted,
                                            user_id=self.user_id,
                                            type='local',
                                            status='active')
            self.local_identities.append(formatted)
        except Exception as exc:
            log.error('Unexpected exception {}'.format(exc))
        return False
