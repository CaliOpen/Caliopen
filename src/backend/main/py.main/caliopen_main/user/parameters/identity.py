# -*- coding: utf-8 -*-
"""Caliopen user parameters."""

from schematics.models import Model
from schematics.types import StringType, UUIDType


class Identity(Model):
    identifier = StringType()
    type = StringType()


class LocalIdentity(Model):
    display_name = StringType()
    identifier = StringType()
    status = StringType()
    type = StringType()
    user_id = UUIDType(required=True)
