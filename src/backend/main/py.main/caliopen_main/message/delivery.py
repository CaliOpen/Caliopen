# -*- coding: utf-8 -*-
"""Caliopen user message delivery logic."""
from __future__ import absolute_import, print_function, unicode_literals
import logging

from caliopen_storage.exception import NotFound
from ..user.core import ContactLookup, User

from caliopen_main.objects.message import Message
from caliopen_main.message.core import RawMessage, UserRawLookup

from caliopen_main.discussion.core.discussion import (Discussion,
                                                      DiscussionMessageLookup,
                                                      DiscussionRecipientLookup,
                                                      DiscussionExternalLookup)

from caliopen_main.message.qualifier import UserMessageQualifier

from ..message.parameters.message import Recipient
# XXX use a message formatter registry not directly mail format
from caliopen_main.parsers import MailMessage

log = logging.getLogger(__name__)


class UserMessageDelivery(object):
    """User message delivery processing."""

    _lookups = {
        'parent': DiscussionMessageLookup,
        'list': DiscussionRecipientLookup,
        'recipient': DiscussionRecipientLookup,
        'external_thread': DiscussionExternalLookup,
        'from': DiscussionRecipientLookup,
    }

    def _get_recipients(self, user, msg):
        """Format recipients and try to resolve as contact."""
        recipients = []
        for type, recips in msg.recipients.iteritems():
            for addr, real_addr in recips:
                if addr != user.user_id:
                    recipient = Recipient()
                    recipient.address = real_addr
                    recipient.type = type
                    recipient.protocol = 'email'
                    recipient.label = addr
                    try:
                        log.debug('Try to resolve contact %s' % addr)
                        contact = ContactLookup.get(user, addr)
                        recipient.contact_id = str(contact.contact_id)
                        if contact.title:
                            recipient.label = contact.title
                    except NotFound:
                        pass

                    # XXX what to do if validation fail
                    recipient.validate()
                    recipients.append(recipient)
        return recipients

    def process_email_raw(self, user_id, raw_msg_id):
        """
        Process a raw inbound email for an user, ie makes it a rich 'message'


        the raw email must have been previously stored into db
        This process is triggered by a "process_email_raw" order on nats
        
        #### TODO : finish refactoring if we still need this func
                    as it is replaced by process_email_message below
        """
        msg = RawMessage.get(raw_msg_id)
        if not msg:
            log.error('Raw message <{}> not found'.
                      format(raw_msg_id))
            raise NotFound
        log.debug('Retrieved raw message {}'.
                  format(raw_msg_id))

        # XXX should use raw message type to use correct message formatter
        mail = MailMessage(msg.data)

        message = mail.to_parameter()
        message.raw_msg_id = msg.raw_msg_id

        user = User.get(user_id)
        if not user:
            log.error('user <{}> not found'.
                      format(user_id))
            raise NotFound

        message.recipients = self._get_recipients(user, mail)
        addresses = [x.address for x in message.recipients]
        log.debug('Resolved recipients {}'.format(addresses))

        ####should have :
        #
        # message = Message.unmarshall_raw_email(user, message)
        # self.process_message(message.user_id, message.message_id)

    def process_message(self, user_id, msg_id):
        """
        Process a new inbound message for an user


        The raw message (ie email…) & its 'Message' model counterpart
        have been previously unmarshaled into db by the email broker
        This is the beginning of the message's enrichment process.

        This process is triggered by a "process_email_message" order on nats
        """
        try:
            message = Message(user_id=user_id, message_id=msg_id)
            message.get_db()
            message.unmarshall_db()
        except Exception as exc:
            print(exc)
            log.error('Error fetching message'.format(exc))
            raise NotFound

        try:
            message_qualifier = UserMessageQualifier()
            message_qualifier.process_inbound(message)
        except Exception as exc:
            raise exc
