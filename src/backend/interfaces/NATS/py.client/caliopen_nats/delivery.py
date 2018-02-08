# -*- coding: utf-8 -*-
"""Caliopen user message delivery logic."""
from __future__ import absolute_import, print_function, unicode_literals
import logging
import uuid

import datetime
import pytz
from caliopen_storage.exception import NotFound
from caliopen_main.message.core import RawMessage
from caliopen_main.message.objects.message import Message
from caliopen_pi.qualifiers import UserMessageQualifier

log = logging.getLogger(__name__)


class UserMessageDelivery(object):
    """User message delivery processing."""

    def __init__(self, user):
        """Create a new UserMessageDelivery belong to an user."""
        self.user = user

    def process_raw(self, raw_msg_id):
        """Process a raw message for an user, ie makes it a rich 'message'."""
        raw = RawMessage.get(raw_msg_id)
        if not raw:
            log.error('Raw message <{}> not found'.format(raw_msg_id))
            raise NotFound
        log.debug('Retrieved raw message {}'.format(raw_msg_id))

        qualifier = UserMessageQualifier(self.user)
        message = qualifier.process_inbound(raw)

        # store and index message
        obj = Message(user=self.user)
        obj.unmarshall_dict(message.to_native())
        obj.user_id = uuid.UUID(self.user.user_id)
        obj.message_id = uuid.uuid4()
        obj.date_insert = datetime.datetime.now(tz=pytz.utc)
        obj.marshall_db()
        obj.save_db()
        obj.marshall_index()
        obj.save_index()
        return obj
