# -*- coding: utf-8 -*-
"""Caliopen user related core classes."""

from __future__ import absolute_import, print_function, unicode_literals

import os
import datetime
import pytz
import bcrypt
import logging
import uuid

from zxcvbn import zxcvbn
from validate_email import validate_email

from caliopen_storage.config import Configuration
from caliopen_storage.exception import NotFound, CredentialException
from ..store import (User as ModelUser,
                     UserName as ModelUserName,
                     UserRecoveryEmail as ModelUserRecoveryEmail,
                     IndexUser,
                     UserTag as ModelUserTag,
                     Settings as ModelSettings,
                     FilterRule as ModelFilterRule,
                     ReservedName as ModelReservedName)
from ..core.identity import UserIdentity, IdentityLookup, IdentityTypeLookup

from caliopen_storage.core import BaseCore
from caliopen_main.common.core import BaseUserCore

from caliopen_main.contact.core import Contact as CoreContact
from caliopen_main.contact.objects.contact import Contact
from caliopen_main.participant.core import ParticipantLookup
from caliopen_main.pi.objects import PIModel
from caliopen_main.user.helpers import validators
from .setups import (setup_index, setup_system_tags,
                     setup_settings)

log = logging.getLogger(__name__)


def allocate_user_shard(user_id):
    """Find allocation to a shard for an user."""
    shards = Configuration('global').get('elasticsearch.shards')
    if not shards:
        raise Exception('No shards configured for index')
    shard_idx = int(user_id.hex, 16) % len(shards)
    return shards[shard_idx]


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
                                          date_insert=datetime.datetime.now(
                                              tz=pytz.utc),
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


class UserRecoveryEmail(BaseCore):
    """User Recovery Email object to retrieve user by recovery_email"""

    _model_class = ModelUserRecoveryEmail
    _pkey_name = 'recovery_email'


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
    def _check_whitelistes(cls, user):
        """Check if user is in a white list if apply."""
        whitelistes = Configuration('global').get('whitelistes', {})
        emails_file = whitelistes.get('user_emails')
        if emails_file and os.path.isfile(emails_file):
            with open(emails_file) as f:
                emails = [x for x in f.read().split('\n') if x]
                if user.recovery_email in emails:
                    return True
                else:
                    raise ValueError('user email not in whitelist')

    @classmethod
    def _check_max_users(cls):
        """Check if maximum number of users reached."""
        conf = Configuration('global').get('system', {})
        max_users = conf.get('max_users', 0)
        if max_users:
            nb_users = User._model_class.objects.count()
            if nb_users >= max_users:
                raise ValueError('Max number of users reached')

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

        # 0. check for user email white list and max number of users
        cls._check_whitelistes(new_user)
        cls._check_max_users()

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

        try:
            cls.validate_recovery_email(new_user.recovery_email)
        except Exception as exc:
            log.info("recovery email failed validation : {}".format(exc))
            raise ValueError(exc)

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
            shard_id = allocate_user_shard(user_id)

            core = super(User, cls).create(user_id=user_id,
                                           name=new_user.name,
                                           password=new_user.password,
                                           recovery_email=recovery,
                                           params=new_user.params,
                                           date_insert=datetime.datetime.now(
                                               tz=pytz.utc),
                                           privacy_features=privacy_features,
                                           pi=pi,
                                           family_name=family_name,
                                           given_name=given_name,
                                           shard_id=shard_id)
        except Exception as exc:
            log.info(exc)
            rollback_username_storage(new_user.name)
            raise exc

        # **** operations below do not raise fatal error and rollback **** #
        # Setup index
        setup_index(core)
        # Setup others entities related to user
        setup_system_tags(core)
        setup_settings(core, new_user.settings)

        UserRecoveryEmail.create(recovery_email=recovery, user_id=user_id)
        # Add a default local identity on a default configured domain
        default_domain = Configuration('global').get('default_domain')
        default_local_id = '{}@{}'.format(core.name, default_domain)
        if not core.add_local_identity(default_local_id):
            log.warn('Impossible to create default local identity {}'.
                     format(default_local_id))

        # save and index linked contact
        if hasattr(new_user, "contact"):
            contact = Contact(user=core, **new_user.contact.serialize())
            contact.contact_id = uuid.uuid4()
            contact.title = Contact._compute_title(contact)

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
            # TOFIX does not work
            # ContactLookup.create(user_id=core.user_id,
            #                     value=default_local_id, type='email',
            #                     contact_ids=[contact.contact_id])

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
    def by_local_identifier(cls, address, protocol):
        """Get a user by one of a local identifier."""
        identities = UserIdentity.get_by_identifier(address.lower(), protocol,
                                                    None)
        for identity in identities:
            if identity.type == 'local':
                return cls.get(identity.user_id)
        raise NotFound

    @classmethod
    def authenticate(cls, user_name, password):
        """Authenticate an user."""
        try:
            user = cls.by_name(user_name)
        except NotFound:
            raise CredentialException('Invalid user')

        if user.date_delete:
            raise CredentialException('Invalid credentials')

        # XXX : decode unicode not this way
        if bcrypt.hashpw(str(password.encode('utf-8')),
                         str(user.password)) == user.password:
            return user
        raise CredentialException('Invalid credentials')

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
        Add a local smtp identity to an user and fill related lookup tables

        return: True if success, False otherwise
        rtype: bool
        """
        formatted = address.lower()
        try:
            local_identity = User.by_local_identifier(address, 'smtp')
            if local_identity:
                log.warn("local identifier {} already exist".format(address))
                return False
        except NotFound:
            try:
                identities = IdentityLookup.find(identifier=formatted)
                if len(identities) == 0: raise NotFound
                for id in identities:
                    identity = UserIdentity.get(self, id.identity_id)
                    if identity and identity.protocol == 'smtp' and \
                            identity.user_id == self.user_id:
                        if identity.identity_id in self.local_identities:
                            # Local identity already created. Should raise error ?
                            return True
                    raise Exception(
                        'Inconsistent local identity {}'.format(address))
            except NotFound:
                display_name = "{} {}".format(self.given_name, self.family_name)
                identity = UserIdentity.create(self, identifier=formatted,
                                               identity_id=uuid.uuid4(),
                                               type='local',
                                               status='active',
                                               protocol='email',
                                               display_name=display_name)
                #  insert entries in relevant lookup tables
                IdentityLookup.create(identifier=identity.identifier,
                                      protocol=identity.protocol,
                                      user_id=identity.user_id,
                                      identity_id=identity.identity_id)
                IdentityTypeLookup.create(type=identity.type,
                                          user_id=identity.user_id,
                                          identity_id=identity.identity_id)
                return True
            except Exception as exc:
                log.error('Unexpected exception {}'.format(exc))
            return False

    @property
    def local_identities(self):
        return IdentityTypeLookup.find(type='local', user_id=self.user_id)

    @classmethod
    def validate_recovery_email(cls, email):
        """
        provided email has to pass the validations below,
        otherwise this func will raise an error
        @:arg email: string
        """

        #  1. is email well-formed ?
        if not validate_email(email):
            raise ValueError("recovery email malformed")

        # 2. is email already in our db ? (recovery_email must be unique)
        try:
            UserRecoveryEmail.get(email)
        except NotFound:
            pass
        else:
            raise ValueError("recovery email already used in this instance")

        # 3. is email belonging to one of our domains ?
        #  (recovery_email must be external)
        domain = email.split("@")[1]
        if domain in Configuration("global").get("default_domain"):
            raise ValueError(
                "recovery email must be outside of this domain instance")

            # 4. TODO: check that provided recovery email can really receive email
            # send a confirmation email ?
