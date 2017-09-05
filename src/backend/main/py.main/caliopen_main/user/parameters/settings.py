# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

from schematics.models import Model
from schematics.types import StringType, IntType


class Settings(Model):
    """Location structure for a device."""

    default_language = StringType()
    default_timezone = StringType()
    date_format = StringType()
    message_display_format = StringType()
    contact_display_format = StringType()
    contact_display_order = StringType()
    contact_phone_format = StringType()
    contact_vcard_format = StringType()
    notification_style = StringType()
    notification_delay = IntType()
