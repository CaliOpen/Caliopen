# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.objects import base
from caliopen_main.user.parameters.types import PhoneNumberType
from uuid import UUID
from caliopen_main.user.store.contact import Phone as ModelPhone
from caliopen_main.user.returns.contact import PhoneParam
from caliopen_main.user.store.contact_index import IndexedPhone


class Phone(base.ObjectIndexable):

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
