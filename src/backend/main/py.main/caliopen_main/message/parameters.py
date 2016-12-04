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
    protocol = StringType(choices=MESSAGE_TYPES)
    contact_id = UUIDType()


class Thread(Model):

    """Existing thread."""

    user_id = UUIDType()
    thread_id = UUIDType(required=True)
    date_insert = StringType()
    date_update = StringType()
    text = StringType(required=True)
    privacy_index = IntType(required=True, default=0)
    importance_level = IntType(required=True, default=0)
    tags = ListType(StringType(), default=lambda: [])
    contacts = ListType(ModelType(Recipient), default=lambda: [])
    total_count = IntType(required=True, default=0)
    unread_count = IntType(required=True, default=0)
    attachment_count = IntType(default=0)

    class Options:
        roles = {'default': blacklist('user_id')}


class Part(Model):

    """Message part."""

    content_type = StringType(required=True)
    filename = StringType()
    data = StringType()
    size = IntType()
    can_index = BooleanType()


class NewMessage(Model):

    """New message parameter."""

    recipients = ListType(ModelType(Recipient),
                          default=lambda: [])
    from_ = StringType(required=True)
    subject = StringType()
    text = StringType(required=True)
    privacy_index = IntType(default=0)
    importance_level = IntType(default=0)
    date = DateTimeType(required=True)
    tags = ListType(StringType)
    # XXX define a part parameter
    parts = ListType(ModelType(Part), default=lambda: [])
    headers = DictType(ListType(StringType), default=lambda: {})
    external_parent_id = StringType()
    external_message_id = StringType()
    external_thread_id = StringType()
    # XXX compute ?
    size = IntType()
    type = StringType(required=True, choices=MESSAGE_TYPES)
    # Only initial state allowed and can bypass unread to read directly
    state = StringType(required=True, choices=['unread', 'draft', 'read'])


class Message(NewMessage):

    """Existing message parameter."""

    user_id = UUIDType()
    message_id = UUIDType(required=True)
    date_insert = DateTimeType(required=True)
    text = StringType()
    # All states allowed
    state = StringType(required=True, choices=MESSAGE_STATES)

    class Options:
        roles = {'default': blacklist('user_id')}
