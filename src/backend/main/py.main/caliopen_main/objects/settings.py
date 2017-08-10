# -*- coding: utf-8 -*-
"""Caliopen User tag parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import types
import uuid

from caliopen_main.user.parameters.settings import Settings as SettingsParam

from caliopen_main.user.store import Settings as ModelSettings
from .base import ObjectUser

log = logging.getLogger(__name__)


class Settings(ObjectUser):
    """Settings related to an user."""

    _attrs = {
        'user_id': uuid.UUID,
        'default_language': types.StringType,
        'default_timezone': types.StringType,
        'date_format': types.StringType,
        'message_display_format': types.StringType,
        'contact_display_order': types.StringType,
        'contact_display_format': types.StringType,
        'contact_phone_format': types.StringType,
        'contact_vcard_format': types.StringType,
        'notification_style': types.StringType,
        'notification_delay': types.IntType,
    }

    _model_class = ModelSettings
    _pkey_name = None
    _json_model = SettingsParam
