# -*- coding: utf-8 -*-
"""Caliopen tags parameters."""

from schematics.models import Model
from schematics.types import StringType, UUIDType, DateTimeType
from schematics.transforms import blacklist

import caliopen_storage.helpers.json as helpers

class NewUserTag(Model):
    """Create a new user tag."""

    user_id = UUIDType()
    name = StringType()

    class Option:
        roles = {'default': blacklist('user_id')}
        serialize_when_none = False


class UserTag(NewUserTag):
    """Existing user tag."""

    type = StringType()
    date_insert = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
