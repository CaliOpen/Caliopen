# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from caliopen_main.common.objects.base import ObjectStorable
from caliopen_main.common.parameters.types import InternetAddressType
from ..parameters import Email as EmailParam
from ..store.contact import Email as ModelEmail


class Email(ObjectStorable):

    _attrs = {
        "address":              InternetAddressType,
        "email_id":             uuid.UUID,
        "is_primary":           bool,
        "label":                str,
        "type":                 str,
    }

    _json_model = EmailParam
    _model_class = ModelEmail
