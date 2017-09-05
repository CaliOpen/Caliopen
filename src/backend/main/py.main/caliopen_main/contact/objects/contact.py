# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from uuid import UUID
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
        'additional_name':     types.StringType,
        'addresses':           [PostalAddress],
        'avatar':              types.StringType,
        'contact_id':          UUID,
        'date_insert':         datetime.datetime,
        'date_update':         datetime.datetime,
        'deleted':             types.BooleanType,
        'emails':              [Email],
        'family_name':         types.StringType,
        'given_name':          types.StringType,
        'groups':              [types.StringType],
        'identities':          [SocialIdentity],
        'ims':                 [IM],
        'infos':               types.DictType,
        'name_prefix':         types.StringType,
        'name_suffix':         types.StringType,
        'organizations':       [Organization],
        'phones':              [Phone],
        'pi':                  PIObject,
        'privacy_features': types.DictType,
        'public_keys':         [PublicKey],
        'tags':                [ResourceTag],
        'title':               types.StringType,
        'user_id':             UUID
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
        if self.user.contact_id == self.contact_id:
            raise Exception("Can't delete contact related to user")
        return super(Contact, self).delete()

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
