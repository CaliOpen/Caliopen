# -*- coding: utf-8 -*-
"""Caliopen user related core classes."""

from __future__ import absolute_import, print_function, unicode_literals
from datetime import datetime
import bcrypt
import logging
import uuid

from elasticsearch import Elasticsearch
from zxcvbn import zxcvbn
from validate_email import validate_email

from caliopen_storage.config import Configuration
from caliopen_storage.exception import NotFound, CredentialException
from ..store import (User as ModelUser,
                     UserName as ModelUserName,
                     Settings as ModelSettings,
                     IndexUser,
                     UserTag as ModelUserTag,
                     FilterRule as ModelFilterRule,
                     ReservedName as ModelReservedName,
                     LocalIdentity as ModelLocalIdentity,
                     RemoteIdentity as ModelRemoteIdentity,
                     ContactLookup)

from caliopen_storage.core import BaseCore, BaseUserCore, core_registry
from .contact import Contact as CoreContact
from caliopen_main.objects.contact import Contact
from caliopen_main.objects.pi import PIModel
from caliopen_main.objects.settings import Settings as ObjectSettings
from caliopen_main.user.helpers import validators

log = logging.getLogger(__name__)


class LocalIdentity(BaseCore):
    """User local identity core class."""

    _model_class = ModelLocalIdentity
    _pkey_name = 'identifier'


class RemoteIdentity(BaseUserCore):
    """User remote identity core class."""

    _model_class = ModelRemoteIdentity
    _pkey_name = 'identifier'


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


class Settings(BaseUserCore):
    """User settings core object."""

    # XXX this core object is here to fill core_registry
    # it's not used, objects representation have to be used.

    _model_class = ModelSettings
    _pkey_name = None


class User(BaseCore):
    """User core object."""

    _model_class = ModelUser
    _pkey_name = 'user_id'
    _index_class = IndexUser

    @classmethod
    def create(cls, new_user):
        """Create a new user.

        @param: new_user is a parameters/user.py.NewUser object
        # 1.check username regex
        # 2.check username is not in reserved_name table
        # 3.check recovery email validity (TODO : check if email is not within
        #   the current Caliopen's instance)
        # 4.check username availability
        # 5.add username to user cassa user_name table (to block the
        #   availability)
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
            # NB : need to rollback this username creation if the below
            #      User creation failed for any reason
        else:
            raise ValueError("Username already exist")

        # 6.
        try:
            user_inputs = [new_user.name.encode("utf-8"),
                           new_user.recovery_email.encode("utf-8")]
            # TODO: add contact inputs if any
            password_strength = zxcvbn(new_user.password,
                                       user_inputs=user_inputs)
            privacy_features = {"password_strength":
                                str(password_strength["score"])}
            passwd = new_user.password.encode('utf-8')
            new_user.password = bcrypt.hashpw(passwd, bcrypt.gensalt())
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
            recovery = new_user.recovery_email
            if hasattr(new_user, "contact"):
                family_name = new_user.contact.family_name
                given_name = new_user.contact.given_name
            else:
                family_name = ""
                given_name = ""

            # XXX PI compute
            pi = PIModel()
            pi.technic = 0
            pi.comportment = 0
            pi.context = 0
            pi.version = 0

            core = super(User, cls).create(user_id=user_id,
                                           name=new_user.name,
                                           password=new_user.password,
                                           recovery_email=recovery,
                                           params=new_user.params,
                                           date_insert=datetime.utcnow(),
                                           privacy_features=privacy_features,
                                           pi=pi,
                                           family_name=family_name,
                                           given_name=given_name
                                           )
        except Exception as exc:
            log.info(exc)
            rollback_username_storage(new_user.name)
            raise exc

        # **** operations below do not raise fatal error and rollback **** #
        # Setup index
        core._setup_user_index()
        # setup others entities related
        core.setup_system_tags()
        core.setup_settings()

        # Add a default local identity on a default configured domain
        default_domain = Configuration('global').get('default_domain')
        default_local_id = '{}@{}'.format(core.name, default_domain)
        if not core.add_local_identity(default_local_id):
            log.warn('Impossible to create default local identity {}'.
                     format(default_local_id))

        # save and index linked contact
        if hasattr(new_user, "contact"):
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

            # fill contact_lookup table
            log.info("contact id : {}".format(contact.contact_id))
            ContactLookup.create(user_id=core.user_id,
                                 value=default_local_id, type='email',
                                 contact_ids=[contact.contact_id])

        core.save()

        return core

    @classmethod
    def by_name(cls, name):
        """Get user by name."""
        uname = UserName.get(name.lower())
        return cls.get(uname.user_id)

    @classmethod
    def is_username_available(cls, username):
        """Return True if username is available."""
        try:
            UserName.get(username.lower())
            return False
        except NotFound:
            return True

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
            if hasattr(kls, "_index_class") and \
                    hasattr(kls._model_class, 'user_id'):
                idx_kls = kls._index_class()
                log.debug('Init index for {}'.format(idx_kls))
                if hasattr(idx_kls, 'create_mapping'):
                    log.info('Create index {} mapping for doc_type {}'.
                             format(self.user_id, idx_kls.doc_type))
                    idx_kls.create_mapping(self.user_id)

    def setup_system_tags(self):
        """Create system tags."""
        default_tags = Configuration('global').get('system.default_tags')
        for tag in default_tags:
            tag['type'] = 'system'
            tag['date_insert'] = datetime.utcnow()
            Tag.create(self, **tag)

    def setup_settings(self):
        """Create settings related to user."""
        # XXX set correct values
        settings = {
            'user_id': self.user_id,
            'default_language': 'en',
            'default_timezone': 'utc',
            'date_format': 'dd/mm/yyyy',
            'message_display_format': 'html',
            'contact_display_order': '',
            'contact_display_format': '',
            'contact_phone_format': 'international',
            'contact_vcard_format': '4.0',
            'notification_style': 'system',
            'notification_delay': 10,
        }

        obj = ObjectSettings(self.user_id)
        obj.unmarshall_dict(settings)
        obj.marshall_db()
        obj.save_db()
        return True

    @property
    def contact(self):
        """User is a contact."""
        if self.contact_id is None:
            return None
        try:
            return CoreContact.get(self, self.contact_id)
        except NotFound:
            log.warn("contact {} not found for user {}".
                     format(self.contact_id, self.user_id))
            return None

    @property
    def tags(self):
        """Tag objects related to an user."""
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
                if identity.identifier in self.local_identities:
                    # Already in local identities
                    return True
            raise Exception('Inconsistent local identity {}'.format(address))
        except NotFound:
            display_name = "{} {}".format(self.given_name, self.family_name)
            identity = LocalIdentity.create(identifier=formatted,
                                            user_id=self.user_id,
                                            type='email',
                                            status='active',
                                            display_name=display_name)
            self.local_identities.append(formatted)
            return True
        except Exception as exc:
            log.error('Unexpected exception {}'.format(exc))
        return False

    def add_remote_identity(self, remote):
        """Add a remote identity to an user.

        return: the RemoteIdentity created instance.
        rtype: RemoteIdentity
        """
        # XXX check for duplicate before insert
        identifier = remote.identifier.lower()
        name = remote.display_name if remote.display_name else identifier
        identity = RemoteIdentity.create(user_id=self.user_id,
                                         identifier=identifier,
                                         display_name=name,
                                         type=remote.type,
                                         status=remote.status,
                                         last_check=None,
                                         infos=remote.infos)
        return identity

    def get_remote_identity(self, identifier):
        """Get an user remote identity."""
        return RemoteIdentity.get(self, identifier)
