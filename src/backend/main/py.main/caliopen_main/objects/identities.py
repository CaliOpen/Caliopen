# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from uuid import UUID

from caliopen_main.objects import base
from caliopen_main.user.store import LocalIdentity as ModelLocalIdentity
from caliopen_main.user.store import IndexedLocalIdentity
from caliopen_main.user.store.contact import SocialIdentity as ModelSocialIdentity
from caliopen_main.user.parameters.contact import \
    SocialIdentity as SocialIdentityParam
from caliopen_main.user.store.contact_index import IndexedSocialIdentity
from caliopen_main.user.store.local_identity import Identity as ModelIdentity
from caliopen_main.user.store.local_identity_index import IndexedIdentity


class LocalIdentity(base.ObjectStorable):

    """Local identity related to an user."""

    _attrs = {
        'display_name': types.StringType,
        'identifier': types.StringType,
        'status': types.StringType,
        'type': types.StringType,
        'user_id': UUID
    }

    _model_class = ModelLocalIdentity
    _pkey_name = 'identifier'
    _db = None  # model instance with datas from db

    _index_class = IndexedLocalIdentity
    _index = None


class SocialIdentity(base.ObjectIndexable):

    _attrs = {
        "contact_id":       UUID,
        "identity_id":      UUID,
        "infos":            {},
        "name":             types.StringType,
        "type":             types.StringType,
        "user_id":          UUID
    }

    _json_model = SocialIdentityParam
    _model_class = ModelSocialIdentity
    _index_class = IndexedSocialIdentity


class Identity(base.ObjectJsonDictifiable):
    """"Reference to an identity embedded in a message """

    _attrs = {
        "identifier": types.StringType,
        "type": types.StringType
    }

    _model_class = ModelIdentity
    _index_class = IndexedIdentity
