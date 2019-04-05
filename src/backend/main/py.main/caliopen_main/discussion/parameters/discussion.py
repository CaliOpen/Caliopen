# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from schematics.models import Model
from schematics.types import (StringType, DateTimeType,
                              IntType, UUIDType, BooleanType)
from schematics.types.compound import ListType, ModelType
from schematics.transforms import blacklist

from caliopen_main.participant.parameters import Participant
import caliopen_storage.helpers.json as helpers


class Discussion(Model):
    """Existing discussion."""

    user_id = UUIDType()
    discussion_id = UUIDType(required=True)
    date_insert = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    date_update = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    last_message_subject = StringType()
    excerpt = StringType(required=True)
    importance_level = IntType(required=True, default=0)
    participants = ListType(ModelType(Participant), default=lambda: [])
    total_count = IntType(required=True, default=0)
    unread_count = IntType(required=True, default=0)
    attachment_count = IntType(default=0)
    subject = StringType()
    protocol = StringType()
    last_message_id = UUIDType(required=True)

    class Options:
        roles = {'default': blacklist('user_id')}
        serialize_when_none = False
