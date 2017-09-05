# -*- coding: utf-8 -*-
"""Caliopen tags parameters."""

from schematics.models import Model
from schematics.types import StringType, UUIDType, DateTimeType, IntType


class ResourceTag(Model):
    """Tag related to a resource."""

    date_insert = DateTimeType()
    importance_level = IntType()
    name = StringType()
    tag_id = UUIDType()
    type = StringType()
