# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.objects import base
from uuid import UUID
from caliopen_main.user.parameters.types import InternetAddressType
from caliopen_main.user.store.contact import IM as ModelIM
from caliopen_main.user.returns.contact import IMParam
from caliopen_main.user.store.contact_index import IndexedInternetAddress


class IM(base.ObjectIndexable):

    _attrs = {
        "address":              InternetAddressType,
        "is_primary":           types.BooleanType,
        "label":                types.StringType,
        "protocol":             types.StringType,
        "type":                 types.StringType,
        "contact_id":           UUID,
        "im_id":                UUID,
        "user_id":              UUID
    }

    _model_class = ModelIM
    _json_model = IMParam
    _index_class = IndexedInternetAddress
