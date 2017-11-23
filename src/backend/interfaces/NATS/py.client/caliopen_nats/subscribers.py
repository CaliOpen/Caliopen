# -*- coding: utf-8 -*-
"""Caliopen inbound nats message handler."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import json

from caliopen_main.user.core import User
from caliopen_main.contact.objects import Contact

from caliopen_nats.delivery import UserMessageDelivery
from caliopen_pi.qualifiers import ContactMessageQualifier

log = logging.getLogger(__name__)


class BaseHandler(object):
    """Base class for NATS message handlers."""

    def __init__(self, nats_cnx):
        """Create a new inbound messsage handler from a nats connection."""
        self.natsConn = nats_cnx


class InboundEmail(BaseHandler):
    """Inbound message class handler."""

    def process_raw(self, msg, payload):
        """Process an inbound raw message."""
        nats_error = {
            'error': '',
            'message': 'inbound email message process failed'
        }
        nats_success = {
            'message': 'OK : inbound email message proceeded'
        }
        user = User.get(payload['user_id'])
        deliver = UserMessageDelivery(user)
        try:
            deliver.process_raw(payload['message_id'])
            self.natsConn.publish(msg.reply, json.dumps(nats_success))
        except Exception as exc:
            log.error("deliver process failed : {}".format(exc))
            nats_error['error'] = str(exc.message)
            self.natsConn.publish(msg.reply, json.dumps(nats_error))
            return exc

    def handler(self, msg):
        """Handle an process_raw nats messages."""
        payload = json.loads(msg.data)
        log.info('Get payload order {}'.format(payload['order']))
        if payload['order'] == "process_raw":
            self.process_raw(msg, payload)
        else:
            log.warn('Unhandled payload type {}'.format(payload['order']))


class ContactAction(BaseHandler):
    """Handler for contact action message."""

    def process_update(self, msg, payload):
        """Process a contact update message."""
        # XXX validate payload structure
        if 'user_id' not in payload or 'contact_id' not in payload:
            raise Exception('Invalid contact_update structure')
        user = User.get(payload['user_id'])
        contact = Contact(user.user_id, contact_id=payload['contact_id'])
        contact.get_db()
        contact.unmarshall_db()
        qualifier = ContactMessageQualifier(user)
        log.info('Will process update for contact {0} of user {1}'.
                 format(contact.contact_id, user.user_id))
        qualifier.process(contact)

    def handler(self, msg):
        """Handle an process_raw nats messages."""
        payload = json.loads(msg.data)
        # log.info('Get payload order {}'.format(payload['order']))
        if payload['order'] == "contact_update":
            self.process_update(msg, payload)
        else:
            log.warn('Unhandled payload type {}'.format(payload['order']))
