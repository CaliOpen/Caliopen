# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid
import datetime

from caliopen_main.common.objects.base import ObjectStorable, ObjectIndexable

from ..store.contact import (Contact as ModelContact,
                             ContactLookup as ModelContactLookup,
                             PublicKey as ModelPublicKey)
from ..store.contact_index import IndexedContact
from ..parameters import Contact as ParamContact

from .email import Email
from .identity import SocialIdentity
from .im import IM
from .organization import Organization
from .phone import Phone
from .postal_address import PostalAddress
from caliopen_main.common.objects.tag import ResourceTag
from caliopen_main.pi.objects import PIObject
from caliopen_storage.exception import NotFound
from caliopen_main.common.errors import ForbiddenAction

import logging
log = logging.getLogger(__name__)


class ContactLookup(ObjectStorable):
    """Contact lookup core class."""

    def __init__(self):
        self._model_class = ModelContactLookup
        self._pkey_name = 'value'


class PublicKey(ObjectStorable):

    def __init__(self):
        self._model_class = ModelPublicKey
        self._pkey_name = 'name'


class Contact(ObjectIndexable):

    # TODO : manage attrs that should not be modifiable directly by users
    _attrs = {
        'additional_name':     str,
        'addresses':           [PostalAddress],
        'avatar':              str,
        'contact_id':          uuid.UUID,
        'date_insert':         datetime.datetime,
        'date_update':         datetime.datetime,
        'deleted':             bool,
        'emails':              [Email],
        'family_name':         str,
        'given_name':          str,
        'groups':              [str],
        'identities':          [SocialIdentity],
        'ims':                 [IM],
        'infos':               dict,
        'name_prefix':         str,
        'name_suffix':         str,
        'organizations':       [Organization],
        'phones':              [Phone],
        'pi':                  PIObject,
        'privacy_features': dict,
        'public_keys':         [PublicKey],
        'tags':                [ResourceTag],
        'title':               str,
        'user_id':             uuid.UUID
    }

    _json_model = ParamContact

    # operations related to cassandra
    _model_class = ModelContact
    _db = None  # model instance with datas from db
    _pkey_name = "contact_id"
    _relations = {
        'public_keys': PublicKey,
    }
    _lookup_class = ContactLookup
    _lookup_values = {
        'emails': {'value': 'address', 'type': 'email'},
        'ims': {'value': 'address', 'type': 'email'},
        'phones': {'value': 'number', 'type': 'phone'},
        'social_identities': {'value': 'name', 'type': 'social'},
    }

    #  operations related to elasticsearch
    _index_class = IndexedContact
    _index = None

    def delete(self):
        # XXX prevent circular dependency import
        from caliopen_main.user.core.user import User
        user = User.get(self.user_id)
        if user.contact_id == self.contact_id:
            raise ForbiddenAction("Can't delete contact related to user")
        try:
            self.get_db()
            self.get_index()
        except Exception as exc:
            raise NotFound

        try:
            self.delete_db()
            self.delete_index()
        except Exception as exc:
            raise exc

    @classmethod
    def _compute_title(cls, contact):
        elmts = []
        elmts.append(contact.name_prefix) if contact.name_prefix else None
        elmts.append(contact.name_suffix) if contact.name_suffix else None
        elmts.append(contact.given_name) if contact.given_name else None
        elmts.append(contact.additional_name) if \
            contact.additional_name else None
        elmts.append(contact.family_name) if contact.family_name else None
        return " ".join(elmts) if len(elmts) > 0 else " (N/A) "
