# -*- coding: utf-8 -*-
"""Caliopen parameters for message related classes."""
from __future__ import absolute_import, print_function, unicode_literals

from schematics.models import Model
from schematics.types import (StringType, DateTimeType,
                              IntType, UUIDType, BooleanType)
from schematics.types.compound import ListType, ModelType, DictType
from schematics.transforms import blacklist

from .participant import Participant
from .attachment import Attachment
from .external_references import ExternalReferences
from caliopen_pi.parameters import PIParameter
from caliopen_main.user.parameters import ResourceTag
from caliopen_main.user.parameters import Identity

RECIPIENT_TYPES = ['To', 'From', 'Cc', 'Bcc', 'Reply-To', 'Sender']
MESSAGE_TYPES = ['email']
MESSAGE_STATES = ['draft', 'sending', 'sent', 'cancel',
                  'unread', 'read', 'deleted']


class NewMessage(Model):
    """New message parameter."""

    attachments = ListType(ModelType(Attachment), default=lambda: [])
    date = DateTimeType(serialized_format="%Y-%m-%dT%H:%M:%S.%f+00:00",
                        tzd=u'utc')
    discussion_id = UUIDType()
    external_references = ModelType(ExternalReferences)
    identities = ListType(ModelType(Identity), default=lambda: [])
    importance_level = IntType()
    is_answered = BooleanType()
    is_draft = BooleanType()
    is_unread = BooleanType()
    message_id = UUIDType()
    parent_id = StringType()
    participants = ListType(ModelType(Participant), default=lambda: [],
                            required=True)
    privacy_features = DictType(StringType, default=lambda: {})
    pi = ModelType(PIParameter)
    raw_msg_id = UUIDType()
    subject = StringType()
    tags = ListType(ModelType(ResourceTag), default=lambda: [])
    type = StringType(choices=MESSAGE_TYPES)

    class Options:
        serialize_when_none = False


class NewInboundMessage(NewMessage):
    """A new incoming message, having 2 bodies representation."""
    body_html = StringType()
    body_plain = StringType()


class Message(NewMessage):
    """Existing message parameter."""

    body = StringType()
    user_id = UUIDType()
    message_id = UUIDType(required=True)
    raw_msg_id = UUIDType(required=True)
    date_insert = DateTimeType(required=True,
                               serialized_format="%Y-%m-%dT%H:%M:%S.%f+00:00",
                               tzd=u'utc')
    date_delete = DateTimeType()

    class Options:
        roles = {'default': blacklist('user_id', 'date_delete')}
        serialize_when_none = False
