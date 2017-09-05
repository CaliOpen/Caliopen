# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.common.objects.base import ObjectIndexable
from uuid import UUID
from caliopen_main.common.parameters.types import InternetAddressType
from ..store.contact import IM as ModelIM
from ..returns import IMParam
from ..store.contact_index import IndexedInternetAddress


class IM(ObjectIndexable):

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
