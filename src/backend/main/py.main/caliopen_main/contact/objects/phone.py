# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.common.objects.base import ObjectIndexable
from caliopen_main.common.parameters.types import PhoneNumberType
from uuid import UUID
from ..store.contact import Phone as ModelPhone
from ..store.contact_index import IndexedPhone
from ..returns import PhoneParam


class Phone(ObjectIndexable):

    _attrs = {
        "contact_id":               UUID,
        "is_primary":               types.BooleanType,
        "number":                   PhoneNumberType,
        "phone_id":                 UUID,
        "type":                     types.StringType,
        "uri":                      types.StringType,
        "user_id":                  UUID
    }

    _model_class = ModelPhone
    _json_model = PhoneParam
    _index_class = IndexedPhone
