# -*- coding: utf-8 -*-
"""Caliopen contact core classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid
from datetime import datetime

from ..store.contact import (Contact as ModelContact,
                             Lookup as ModelContactLookup,
                             PublicKey as ModelPublicKey,
                             Organization, Email, IM, PostalAddress,
                             Phone, SocialIdentity)

from caliopen_storage.core import BaseCore, BaseUserCore
from caliopen_storage.core.mixin import MixinCoreRelation

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


class PublicKey(BaseContactSubCore):
    _model_class = ModelPublicKey
    _pkey_name = 'name'


class MixinContactNested(object):

    """Mixin class for contact nested objects management."""

    def _add_nested(self, column, nested):
        """Add a nested object to a list."""
        nested.validate()
        kls = self._nested.get(column)
        if not kls:
            raise Exception('No nested class for {}'.format(column))
        column = getattr(self.model, column)
        # Ensure unicity
        if hasattr(kls, 'uniq_name'):
            for value in column:
                uniq = getattr(value, kls.uniq_name)
                if uniq == getattr(nested, kls.uniq_name):
                    raise Exception('Unicity conflict for {}'.format(uniq))
        if hasattr(nested, 'is_primary') and nested.is_primary:
            for old_primary in column:
                column.is_primary = False
        value = nested.to_primitive()
        pkey = getattr(kls, '_pkey')
        value[pkey] = uuid.uuid4()
        log.debug('Will insert nested {} : {}'.format(column, value))
        column.append(kls(**value))
        return value

    def _delete_nested(self, column, nested_id):
        """Delete a nested object with its id from a list."""
        attr = getattr(self, column)
        log.debug('Will delete {} with id {}'.format(column, nested_id))
        found = -1
        for pos in xrange(0, len(attr)):
            nested = attr[pos]
            current_id = str(getattr(nested, nested._pkey))
            if current_id == nested_id:
                found = pos
        if found == -1:
            log.warn('Nested object {}#{} not found for deletion'.
                     format(column, nested_id))
            return None
        return attr.pop(found)


class Contact(BaseUserCore, MixinCoreRelation, MixinContactNested):

    _model_class = ModelContact
    _pkey_name = 'contact_id'

    _relations = {
        'public_keys': PublicKey,
    }

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

    @property
    def user(self):
        # XXX TOFIX we should not be there, bad design
        from .user import User
        return User.get(self.user_id)

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
    def create(cls, user, contact, **related):
        # XXX do sanity check about only one primary for related objects
        # XXX check no extra arguments in related than relations
        def create_nested(values, kls):
            """Create nested objects in store format."""
            nested = []
            for param in values:
                param.validate()
                attrs = param.to_primitive()
                # XXX default value not correctly handled
                pkey = getattr(kls, '_pkey')
                attrs[pkey] = uuid.uuid4()
                nested.append(kls(**attrs))
            return nested
        contact.validate()
        for k, v in related.iteritems():
            if k in cls._relations:
                [x.validate() for x in v]
            else:
                raise Exception('Invalid argument to contact.create : %s' % k)
        # XXX check and format tags and groups
        title = cls._compute_title(contact)
        contact_id = uuid.uuid4()
        attrs = {'contact_id': contact_id,
                 'info': contact.infos,
                 'tags': contact.tags,
                 'groups': contact.groups,
                 'date_insert': datetime.utcnow(),
                 'given_name': contact.given_name,
                 'additional_name': contact.additional_name,
                 'family_name': contact.family_name,
                 'prefix_name': contact.name_prefix,
                 'suffix_name': contact.name_suffix,
                 'title': title,
                 'privacy_index': contact.privacy_index,
                 'emails': create_nested(contact.emails, Email),
                 'ims': create_nested(contact.ims, IM),
                 'phones': create_nested(contact.phones, Phone),
                 'addresses': create_nested(contact.addresses,
                                            PostalAddress),
                 'social_identities': create_nested(contact.identities,
                                                    SocialIdentity),
                 'organizations': create_nested(contact.organizations,
                                                Organization)}

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
        lookup = ContactLookup.get(user, value)
        if lookup:
            return cls.get(user, lookup.contact_id)
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

    @classmethod
    def get_pi(cls, user, contact):
        contact = cls.get(user, contact)
        return contact.privacy_index

    @classmethod
    def get_serialized(cls, user, contact):
        contact = cls.get(user, contact)
        # XXX TOFIX we should not be there, bad design
        from ..returns.contact import ReturnContact
        return ReturnContact.build(contact).serialize()

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
