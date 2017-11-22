# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from caliopen_main.common.objects.base import ObjectIndexable
from caliopen_main.common.parameters.types import InternetAddressType
from ..store.contact import IM as ModelIM
from ..returns import IMParam
from ..store.contact_index import IndexedInternetAddress


class IM(ObjectIndexable):

    _attrs = {
        "address":              InternetAddressType,
        "is_primary":           bool,
        "label":                str,
        "protocol":             str,
        "type":                 str,
        "contact_id":           uuid.UUID,
        "im_id":                uuid.UUID,
        "user_id":              uuid.UUID
    }

    _model_class = ModelIM
    _json_model = IMParam
    _index_class = IndexedInternetAddress
