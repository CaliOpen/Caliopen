# -*- coding: utf-8 -*-
"""Caliopen core user's messages."""
from __future__ import absolute_import, print_function, unicode_literals
import logging
import uuid

from datetime import datetime


from caliopen_storage.core import BaseUserCore
from caliopen_storage.parameters import ReturnCoreObject

from ..store import (Message as ModelMessage,
                                         MessageRecipient, RawMessage)
from ..parameters import Message as ParamMessage


log = logging.getLogger(__name__)


class Message(BaseUserCore):

    """Message core object."""

    _model_class = ModelMessage
    _pkey_name = 'message_id'

    @classmethod
    def create(cls, user, message, thread_id=None, lookup=None):
        """Create a new message for a given user."""
        message.validate()

        def create_nested(values, kls):
            """Create nested objects in store format."""
            nested = []
            for param in values:
                param.validate()
                attrs = param.to_primitive()
                nested.append(kls(**attrs))
            return nested

        parent_id = message.external_parent_id
        message_id = uuid.uuid4()
        answer_to = lookup.message_id if lookup else None

        recipients = create_nested(message.recipients, MessageRecipient)

        # TODO : index parts information
        extras = {'headers': message.headers,
                  'text': message.text,
                  'answer_to': answer_to}
        attrs = {'message_id': message_id,
                 'thread_id': thread_id,
                 'type': message.type,
                 'state': message.state,
                 'from_': message.from_,
                 'date': message.date,
                 'date_insert': datetime.utcnow(),
                 'size': message.size,
                 'privacy_index': message.privacy_index,
                 'importance_level': message.importance_level,
                 'subject': message.subject,
                 'external_message_id': message.external_message_id,
                 'external_parent_id': parent_id,
                 'tags': message.tags,
                 'flags': ['Recent'],
                 'lookup': lookup,
                 'recipients': recipients,
                 'text': message.text,
                 '_indexed_extra': extras}
        return super(Message, cls).create(user, **attrs)

    @classmethod
    def by_thread_id(cls, user, thread_id, min_pi, max_pi,
                     order=None, limit=None, offset=0):
        """Get messages for a given thread from index."""
        res = cls._model_class.search(user, thread_id=thread_id,
                                      min_pi=min_pi, max_pi=max_pi,
                                      limit=limit,
                                      offset=offset)
        log.debug('search  result{}'.format(res))
        messages = []
        if res.hits:
            messages = [cls.get(user, x.meta.id) for x in res.hits]
        return {'hits': messages, 'total': res.hits.total}

    @property
    def raw(self):
        """Return raw text from message."""
        # XXX do not use RawMessage lookup
        raw = RawMessage.get(self.user, str(self.external_message_id))
        msg = raw.parse()
        return msg.text


class ReturnMessage(ReturnCoreObject):

    """Return parameter from a core message."""

    _core_class = Message
    _return_class = ParamMessage
