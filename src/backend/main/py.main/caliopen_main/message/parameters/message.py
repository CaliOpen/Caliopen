# -*- coding: utf-8 -*-
"""Caliopen parameters for message related classes."""

from schematics.models import Model
from schematics.types import (StringType, DateTimeType,
                              IntType, UUIDType, BooleanType)
from schematics.types.compound import ListType, ModelType
from schematics.transforms import blacklist

from caliopen_main.user.parameters import ResourceTag
from caliopen_main.message.parameters.attachment import Attachment
from caliopen_main.message.parameters.external_references import \
    ExternalReferences as ParamExternalReferences
from caliopen_main.message.parameters.participant import Participant
from caliopen_main.message.parameters.privacy_features import PrivacyFeatures

from caliopen_main.user.parameters.identity import LocalIdentity

RECIPIENT_TYPES = ['To', 'From', 'Cc', 'Bcc', 'Reply-To', 'Sender']
MESSAGE_TYPES = ['email']
MESSAGE_STATES = ['draft', 'sending', 'sent', 'cancel',
                  'unread', 'read', 'deleted']


class NewMessage(Model):
    """New message parameter."""

    attachments = ListType(ModelType(Attachment), default=lambda: [])
    body = StringType()
    date = DateTimeType(serialized_format="%Y-%m-%dT%H:%M:%S.%f+00:00",
                        tzd=u'utc')
    discussion_id = UUIDType()
    external_references = ModelType(ParamExternalReferences)
    identities = ListType(ModelType(LocalIdentity), default=lambda: [])
    importance_level = IntType()
    is_answered = BooleanType()
    is_draft = BooleanType()
    is_unread = BooleanType()
    parent_id = StringType()
    participants = ListType(ModelType(Participant),
                            default=lambda: [], required=True)
    privacy_features = ModelType(PrivacyFeatures)
    subject = StringType()
    tags = ListType(ModelType(ResourceTag), default=lambda: [])
    type = StringType(choices=MESSAGE_TYPES)

    class Options:
        serialize_when_none = False


class Message(NewMessage):
    """Existing message parameter."""

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


class Part(Model):
    """Message part."""

    content_type = StringType(required=True)
    filename = StringType()
    data = StringType()
    size = IntType()
    can_index = BooleanType()

    class Options:
        serialize_when_none = False


class Recipient(Model):
    """Store a contact reference and one of it's address used in a message."""

    address = StringType(required=True)
    label = StringType(required=True)
    type = StringType(required=True, choices=RECIPIENT_TYPES)
    protocol = StringType(choices=MESSAGE_TYPES)
    contact_id = UUIDType()

    class Options:
        serialize_when_none = False
