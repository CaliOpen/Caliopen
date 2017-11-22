# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from caliopen_main.common.objects.base import ObjectStorable, \
    ObjectJsonDictifiable

from ..store import LocalIdentity as ModelLocalIdentity
from ..store import IndexedLocalIdentity
from ..store.local_identity import Identity as ModelIdentity
from ..store.local_identity_index import IndexedIdentity


class LocalIdentity(ObjectStorable):
    """Local identity related to an user."""

    _attrs = {
        'display_name': str,
        'identifier': str,
        'status': str,
        'type': str,
        'user_id': uuid.UUID
    }

    _model_class = ModelLocalIdentity
    _pkey_name = 'identifier'
    _db = None  # model instance with datas from db

    _index_class = IndexedLocalIdentity
    _index = None


class Identity(ObjectJsonDictifiable):
    """"Reference to an identity embedded in a message."""

    _attrs = {
        "identifier": str,
        "type": str
    }

    _model_class = ModelIdentity
    _index_class = IndexedIdentity
