# -*- coding: utf-8 -*-
"""Caliopen parameters for message related classes."""

from schematics.models import Model
from schematics.types import (StringType, DateTimeType,
                              IntType, UUIDType, BooleanType)
from schematics.types.compound import ListType, ModelType, DictType
from schematics.transforms import blacklist

RECIPIENT_TYPES = ['to', 'from', 'cc', 'bcc']
MESSAGE_TYPES = ['email']
MESSAGE_STATES = ['draft', 'sending', 'sent', 'cancel',
                  'unread', 'read', 'deleted']


class Recipient(Model):

    """Store a contact reference and one of it's address used in a message."""

    address = StringType(required=True)
    label = StringType(required=True)
    type = StringType(required=True, choices=RECIPIENT_TYPES)
    protocol = StringType(choices=MESSAGE_TYPES, serialize_when_none=False)
    contact_id = UUIDType(serialize_when_none=False)


class Thread(Model):

    """Existing thread."""

    user_id = UUIDType(serialize_when_none=False)
    thread_id = UUIDType(required=True)
    date_insert = DateTimeType(serialize_when_none=False)
    date_update = DateTimeType(serialize_when_none=False)
    text = StringType(required=True)
    privacy_index = IntType(required=True, default=0)
    importance_level = IntType(required=True, default=0)
    tags = ListType(StringType(), default=lambda: [], serialize_when_none=False)
    contacts = ListType(ModelType(Recipient), default=lambda: [], serialize_when_none=False)
    total_count = IntType(required=True, default=0)
    unread_count = IntType(required=True, default=0)
    attachment_count = IntType(default=0, serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id')}


class Part(Model):

    """Message part."""

    content_type = StringType(required=True)
    filename = StringType(serialize_when_none=False)
    data = StringType(serialize_when_none=False)
    size = IntType(serialize_when_none=False)
    can_index = BooleanType(serialize_when_none=False)


class NewMessage(Model):

    """New message parameter."""

    recipients = ListType(ModelType(Recipient),
                          default=lambda: [], serialize_when_none=False)
    from_ = StringType(required=True)
    subject = StringType(serialize_when_none=False)
    text = StringType(required=True)
    privacy_index = IntType(default=0, serialize_when_none=False)
    importance_level = IntType(default=0, serialize_when_none=False)
    date = DateTimeType(required=True)
    tags = ListType(StringType, serialize_when_none=False)
    # XXX define a part parameter
    parts = ListType(ModelType(Part), default=lambda: [], serialize_when_none=False)
    headers = DictType(ListType(StringType), default=lambda: {}, serialize_when_none=False)
    external_parent_id = StringType(serialize_when_none=False)
    external_message_id = StringType(serialize_when_none=False)
    external_thread_id = StringType(serialize_when_none=False)
    # XXX compute ?
    size = IntType(serialize_when_none=False)
    type = StringType(required=True, choices=MESSAGE_TYPES)
    # Only initial state allowed and can bypass unread to read directly
    state = StringType(required=True, choices=['unread', 'draft', 'read'])


class Message(NewMessage):

    """Existing message parameter."""

    user_id = UUIDType(serialize_when_none=False)
    message_id = UUIDType(required=True)
    date_insert = DateTimeType(required=True)
    text = StringType(serialize_when_none=False)
    # All states allowed
    state = StringType(required=True, choices=MESSAGE_STATES)

    class Options:
        roles = {'default': blacklist('user_id')}
