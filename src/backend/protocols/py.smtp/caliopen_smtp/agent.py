# -*- coding: utf-8 -*-

from __future__ import unicode_literals

import logging
from mailbox import Message as Rfc2822

from caliopen_main.message.core import RawMessage
from caliopen_main.user.core import User
from caliopen_main.message.delivery import UserMessageDelivery

log = logging.getLogger(__name__)


class DeliveryAgent(object):

    """Main logic for delivery of a mail message."""

    def __init__(self):
        self.direct = True
        self.deliver = UserMessageDelivery()

    def process_user_mail(self, user, message_id):
        # XXX : logic here, for user rules etc
        qmsg = {'user_id': user.user_id, 'message_id': message_id}
        log.debug('Will publish %r' % qmsg)
        self.deliver.process(user, message_id)

    def resolve_users(self, rpcts):
        users = []
        for rcpt in rpcts:
            user = User.by_local_identity(rcpt)
            users.append(user)
        return users

    def parse_mail(self, buf):
        try:
            mail = Rfc2822(buf)
        except Exception as exc:
            log.error('Parse message failed %s' % exc)
            raise
        if mail.defects:
            # XXX what to do ?
            log.warn('Defects on parsed mail %r' % mail.defects)
        return mail

    def process(self, mailfrom, rcpts, buf):
        """
        Process a mail from buffer, to deliver it to users that can be found
        """
        users = self.resolve_users(rcpts)
        if users:
            mail = self.parse_mail(buf)
            message_id = mail.get('Message-ID')
            if not message_id:
                raise Exception('No Message-ID found')
            for user in users:
                # Create raw message
                log.debug('Will create raw for message-id %s and user %r' %
                          (message_id, user.user_id))
                raw = RawMessage.create(user, message_id, buf)
                log.debug('Created raw message %r' % raw.raw_id)
                self.process_user_mail(user, message_id)
            return raw.raw_id
        else:
            log.warn('No user for mail')
