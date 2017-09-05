# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.common.objects.base import ObjectStorable
from uuid import UUID
from caliopen_main.common.parameters.types import InternetAddressType
from ..parameters import Email as EmailParam
from ..store.contact import Email as ModelEmail


class Email(ObjectStorable):

    _attrs = {
        "address":              InternetAddressType,
        "email_id":             UUID,
        "is_primary":           types.BooleanType,
        "label":                types.StringType,
        "type":                 types.StringType,
    }

    _json_model = EmailParam
    _model_class = ModelEmail
