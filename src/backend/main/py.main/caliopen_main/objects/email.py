# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.objects import base
from uuid import UUID
from caliopen_main.user.parameters.types import InternetAddressType
from caliopen_main.user.store.contact import Email as ModelEmail
from caliopen_main.user.returns.contact import EmailParam
from caliopen_main.user.store.contact_index import IndexedInternetAddress


class Email(base.ObjectStorable):

    _attrs = {
        "address":              InternetAddressType,
        "email_id":             UUID,
        "is_primary":           types.BooleanType,
        "is_backup":            types.BooleanType,
        "label":                types.StringType,
        "type":                 types.StringType,
    }

    _json_model = EmailParam
    _model_class = ModelEmail
