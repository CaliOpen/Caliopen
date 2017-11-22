# -*- coding: utf-8 -*-
"""Caliopen User tag parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid

from caliopen_main.user.parameters.settings import Settings as SettingsParam

from caliopen_main.user.store import Settings as ModelSettings
from caliopen_main.common.objects.base import ObjectUser

log = logging.getLogger(__name__)


class Settings(ObjectUser):
    """Settings related to an user."""

    _attrs = {
        'user_id': uuid.UUID,
        'default_locale': str,
        'message_display_format': str,
        'contact_display_order': str,
        'contact_display_format': str,
        'notification_enabled': bool,
        'notification_message_preview': str,
        'notification_sound_enabled': bool,
        'notification_delay_disappear': int,
    }

    _model_class = ModelSettings
    _pkey_name = None
    _json_model = SettingsParam
