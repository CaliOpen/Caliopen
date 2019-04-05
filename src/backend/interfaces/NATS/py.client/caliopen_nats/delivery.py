# -*- coding: utf-8 -*-
"""Caliopen user message delivery logic."""
from __future__ import absolute_import, print_function, unicode_literals
import logging
import uuid

import datetime
import pytz
from caliopen_storage.exception import NotFound
from caliopen_main.message.core import RawMessage, MessageExternalRefLookup
from caliopen_main.message.store import \
    MessageExternalRefLookup as ModelMessageExternalRefLookup
from caliopen_main.message.objects.message import Message
from caliopen_pi.qualifiers import UserMessageQualifier, UserDMQualifier

log = logging.getLogger(__name__)

DUPLICATE_MESSAGE_EXC = "message already imported for this user"


class UserMessageDelivery(object):

    def __init__(self, user, identity):
        """Create a new UserMessageDelivery belong to an user."""
        self.user = user
        self.identity = identity
        self.qualifier = None

    def process_raw(self, raw_msg_id):
        """Process a raw message for an user, ie makes it a rich 'message'."""
        raw = RawMessage.get(raw_msg_id)
        if not raw:
            log.error('Raw message <{}> not found'.format(raw_msg_id))
            raise NotFound
        log.debug('Retrieved raw message {}'.format(raw_msg_id))

        message = self.qualifier.process_inbound(raw)
        external_refs = ModelMessageExternalRefLookup.filter(
            user_id=self.user.user_id,
            external_msg_id=message.external_msg_id)
        if external_refs:
            # message already imported, update it with identity_id if needed
            for external_ref in external_refs:
                obj = Message(user=self.user,
                              message_id=external_ref.message_id)
                if str(external_ref.identity_id) != self.identity.identity_id:
                    obj.get_db()
                    obj.unmarshall_db()
                    obj.user_identities.append(self.identity.identity_id)
                    obj.marshall_db()
                    obj.save_db()
                    obj.marshall_index()
                    obj.save_index()
                    MessageExternalRefLookup.create(self.user,
                                                    external_msg_id=external_ref.external_msg_id,
                                                    identity_id=self.identity.identity_id,
                                                    message_id=external_ref.message_id)
            raise Exception(DUPLICATE_MESSAGE_EXC)

        # store and index Message
        obj = Message(user=self.user)
        obj.unmarshall_dict(message.to_native())
        obj.user_id = uuid.UUID(self.user.user_id)
        obj.user_identities = [uuid.UUID(self.identity.identity_id)]
        obj.message_id = uuid.uuid4()
        obj.date_insert = datetime.datetime.now(tz=pytz.utc)
        obj.date_sort = obj.date_insert
        obj.marshall_db()
        obj.save_db()
        obj.marshall_index()
        obj.save_index()

        # store external_msg_id in lookup table
        # but do not abort if it failed
        try:
            MessageExternalRefLookup.create(self.user,
                                            external_msg_id=obj.external_msg_id,
                                            identity_id=obj.user_identity,
                                            message_id=obj.message_id)
        except Exception as exc:
            log.exception("UserMessageDelivery failed "
                          "to store message_external_ref : {}".format(exc))
        return obj


class UserMailDelivery(UserMessageDelivery):
    """User email delivery processing."""

    def __init__(self, user, identity):
        super(UserMailDelivery, self).__init__(user, identity)
        self.qualifier = UserMessageQualifier(self.user, self.identity)


class UserTwitterDMDelivery(UserMessageDelivery):
    """Twitter Direct Message delivery processing"""

    def __init__(self, user, identity):
        super(UserTwitterDMDelivery, self).__init__(user, identity)
        self.qualifier = UserDMQualifier(self.user, self.identity)
