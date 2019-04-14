# -*- coding: utf-8 -*-
"""Caliopen contact core classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid
import datetime
import pytz
import phonenumbers

from .store import (Contact as ModelContact,
                    ContactLookup as ModelContactLookup,
                    Organization, Email, IM, PostalAddress,
                    Phone, SocialIdentity)
from .store.contact_index import IndexedContact
from caliopen_storage.core import BaseCore
from caliopen_storage.exception import NotFound
from caliopen_storage.core.mixin import MixinCoreRelation, MixinCoreNested
from caliopen_main.pi.objects import PIModel
from caliopen_main.common.core import BaseUserCore
from caliopen_main.participant.core import ParticipantLookup
from caliopen_main.participant.objects import Participant

log = logging.getLogger(__name__)


class ContactLookup(BaseUserCore):
    """Contact lookup core class."""

    _model_class = ModelContactLookup
    _pkey_name = 'value'


class BaseContactSubCore(BaseCore):
    """
    Base core object for contact related objects
    """

    @classmethod
    def create(cls, user, contact, **kwargs):
        obj = cls._model_class.create(user_id=user.user_id,
                                      contact_id=contact.contact_id,
                                      **kwargs)
        return cls(obj)

    @classmethod
    def get(cls, user, contact, value):
        kwargs = {cls._pkey_name: value}
        try:
            obj = cls._model_class.get(user_id=user.user_id,
                                       contact_id=contact.contact_id,
                                       **kwargs)
            return cls(obj)
        except Exception:
            return None

    @classmethod
    def find(cls, user, contact, filters=None):
        q = cls._model_class.filter(user_id=user.user_id). \
            filter(contact_id=contact.contact_id)
        if not filters:
            objs = q
        else:
            objs = q.filter(**filters)
        return {'total': len(objs), 'data': [cls(x) for x in objs]}

    def to_dict(self):
        return {col: getattr(self, col)
                for col in self._model_class._columns.keys()}


class Contact(BaseUserCore, MixinCoreRelation, MixinCoreNested):
    _model_class = ModelContact
    _pkey_name = 'contact_id'
    _index_class = IndexedContact

    _nested = {
        'emails': Email,
        'phones': Phone,
        'ims': IM,
        'social_identities': SocialIdentity,
        'addresses': PostalAddress,
        'organizations': Organization,
    }

    # Any of these nested objects,can be a lookup value
    _lookup_class = ContactLookup
    _lookup_values = {
        'emails': {'value': 'address', 'type': 'email'},
        'ims': {'value': 'address', 'type': 'email'},
        'phones': {'value': 'number', 'type': 'phone'},
        'social_identities': {'value': 'name', 'type': 'social'},
    }

    @classmethod
    def _compute_title(cls, contact):
        elmts = []
        elmts.append(contact.name_prefix) if contact.name_prefix else None
        elmts.append(contact.name_suffix) if contact.name_suffix else None
        elmts.append(contact.given_name) if contact.given_name else None
        elmts.append(contact.additional_name) if \
            contact.additional_name else None
        elmts.append(contact.family_name) if contact.family_name else None
        # XXX may be empty, got info from related infos
        return " ".join(elmts)

    def _create_lookup(self, type, value):
        """Create one contact lookup."""
        log.debug('Will create lookup for type {} and value {}'.
                  format(type, value))
        lookup = ContactLookup.create(self.user, value=value, type=type,
                                      contact_id=self.contact_id)
        participant = Participant(address=value, protocol=type)
        ParticipantLookup.update(self.user, self.contact_id, participant)

        return lookup

    def _create_lookups(self):
        """Create lookups for a contact using its nested attributes."""
        for attr_name, obj in self._lookup_values.items():
            nested = getattr(self, attr_name)
            if nested:
                for attr in nested:
                    lookup_value = attr[obj['value']]
                    if lookup_value:
                        self._create_lookup(obj['type'], lookup_value)

    @classmethod
    def normalize_phones(cls, phones):
        for phone in phones:
            try:
                normalized = phonenumbers.parse(phone.number, None)
                phone_format = phonenumbers.PhoneNumberFormat.INTERNATIONAL
                new = phonenumbers.format_number(normalized, phone_format)
                phone.normalized_number = new
            except:
                pass

    @classmethod
    def create(cls, user, contact, **related):
        # XXX do sanity check about only one primary for related objects
        # XXX check no extra arguments in related than relations

        contact.validate()
        for k, v in related.iteritems():
            if k in cls._relations:
                [x.validate() for x in v]
            else:
                raise Exception('Invalid argument to contact.create : %s' % k)

        contact_id = uuid.uuid4()
        if not contact.title:
            title = cls._compute_title(contact)
        else:
            title = contact.title
            if not contact.given_name and not contact.family_name:
                # XXX more complex logic and not arbitrary order and character
                if ',' in contact.title:
                    gn, fn = contact.title.split(',', 2)
                    contact.given_name = gn.rstrip().lstrip()
                    contact.family_name = fn.rstrip().lstrip()

        # XXX PI compute
        pi = PIModel()
        pi.technic = 0
        pi.comportment = 0
        pi.context = 0
        pi.version = 0
        phones = cls.create_nested(contact.phones, Phone)
        # Normalize phones if possible
        cls.normalize_phones(phones)

        attrs = {'contact_id': contact_id,
                 'info': contact.infos,
                 'groups': contact.groups,
                 'date_insert': datetime.datetime.now(tz=pytz.utc),
                 'given_name': contact.given_name,
                 'additional_name': contact.additional_name,
                 'family_name': contact.family_name,
                 'prefix_name': contact.name_prefix,
                 'suffix_name': contact.name_suffix,
                 'title': title,
                 'emails': cls.create_nested(contact.emails, Email),
                 'ims': cls.create_nested(contact.ims, IM),
                 'phones': phones,
                 'addresses': cls.create_nested(contact.addresses,
                                                PostalAddress),
                 'social_identities': cls.create_nested(contact.identities,
                                                        SocialIdentity),
                 'organizations': cls.create_nested(contact.organizations,
                                                    Organization),
                 'tags': contact.tags,
                 'pi': pi}

        core = super(Contact, cls).create(user, **attrs)
        log.debug('Created contact %s' % core.contact_id)
        core._create_lookups()
        # Create relations
        related_cores = {}
        for k, v in related.iteritems():
            if k in cls._relations:
                for obj in v:
                    log.debug('Processing object %r' % obj)
                    # XXX check only one is_primary per relation using it
                    new_core = cls._relations[k].create(user, core, **obj)
                    related_cores.setdefault(k, []).append(new_core.to_dict())
                    log.debug('Created related core %r' % new_core)
        return core

    @classmethod
    def lookup(cls, user, value):
        lookup = ContactLookup._model_class.get(user_id=user.user_id,
                                                    value=value)
        if lookup and lookup.contact_id:
            # as of 2019, april it is forbidden in Caliopen
            # to add an external address to more than one contact
            # as a mater of fact, lookup should always return one contact only
            try:
                return cls.get(user, lookup.contact_id)
            except NotFound:
                log.warn('Inconsistent contact lookup with non existing '
                         ' contact %r' % lookup.contact_id)
                return None
        # XXX something else to do ?
        return None

    def delete(self):
        if self.user.contact_id == self.contact_id:
            raise Exception("Can't delete contact related to user")
        return super(Contact, self).delete()

    @property
    def public_keys(self):
        """Return detailed public keys."""
        return self._expand_relation('public_keys')

    # MixinCoreRelation methods
    def add_organization(self, organization):
        return self._add_nested('organizations', organization)

    def delete_organization(self, organization_id):
        return self._delete_nested('organizations', organization_id)

    def add_address(self, address):
        return self._add_nested('addresses', address)

    def delete_address(self, address_id):
        return self._delete_nested('addresses', address_id)

    def add_email(self, email):
        return self._add_nested('emails', email)

    def delete_email(self, email_addr):
        return self._delete_nested('emails', email_addr)

    def add_im(self, im):
        return self._add_nested('ims', im)

    def delete_im(self, im_addr):
        return self._delete_nested('ims', im_addr)

    def add_phone(self, phone):
        return self._add_nested('phones', phone)

    def delete_phone(self, phone_num):
        return self._delete_nested('phones', phone_num)

    def add_social_identity(self, identity):
        return self._add_nested('social_identities', identity)

    def delete_social_identity(self, identity_name):
        return self._delete_nested('social_identities', identity_name)

    def add_public_key(self, key):
        # XXX Compute fingerprint and check key validity
        return self._add_relation('public_keys', key)

    def delete_public_key(self, key_id):
        return self._delete_relation('public_keys', key_id)
