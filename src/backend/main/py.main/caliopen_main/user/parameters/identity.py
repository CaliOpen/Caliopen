# -*- coding: utf-8 -*-
"""Caliopen user parameters."""

from schematics.models import Model
from schematics.types import StringType, UUIDType, DateTimeType
from schematics.types.compound import DictType

import caliopen_storage.helpers.json as helpers

REMOTE_IDENTITY_TYPES = ['imap']
REMOTE_IDENTITY_STATUS = ['active', 'inactive', 'deleted']


class Identity(Model):
    identifier = StringType()
    type = StringType()


class LocalIdentity(Model):
    display_name = StringType()
    identifier = StringType(required=True)
    status = StringType()
    type = StringType()
    user_id = UUIDType()


class NewRemoteIdentity(Model):
    identifier = StringType(required=True)
    display_name = StringType()
    status = StringType(default='active', choices=REMOTE_IDENTITY_STATUS)
    type = StringType(choices=REMOTE_IDENTITY_TYPES)
    infos = DictType(StringType, default=lambda: {})


class RemoteIdentity(NewRemoteIdentity):
    user_id = UUIDType()
    last_check = DateTimeType(serialized_format=helpers.RFC3339Milli,
                              tzd=u'utc')
