# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.objects import base
from uuid import UUID
import datetime
from caliopen_main.user.store.contact import (Contact as ModelContact,
                             Lookup as ModelContactLookup,
                             PublicKey as ModelPublicKey)
from caliopen_main.user.store.contact_index import IndexedContact
from caliopen_main.user.parameters.contact import Contact as ParamContact

from .email import Email
from .social_identity import SocialIdentity
from .im import IM
from .organization import Organization
from .phone import Phone
from .postal_address import PostalAddress
from .tag import ResourceTag


import logging
log = logging.getLogger(__name__)


class ContactLookup(base.ObjectStorable):
    """Contact lookup core class."""

    def __init__(self):
        self._model_class = ModelContactLookup
        self._pkey_name = 'value'


class PublicKey(base.ObjectStorable):

    def __init__(self):
        self._model_class = ModelPublicKey
        self._pkey_name = 'name'


class Contact(base.ObjectIndexable):

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
        'privacy_features':    types.DictType,
        'privacy_index':       types.IntType,
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
