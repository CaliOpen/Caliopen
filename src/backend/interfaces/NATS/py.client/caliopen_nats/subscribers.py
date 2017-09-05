# -*- coding: utf-8 -*-
"""Caliopen inbound nats message handler."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import json

from caliopen_nats.delivery import UserMessageDelivery
from caliopen_main.user.core import User

log = logging.getLogger(__name__)


class InboundEmail(object):
    """Inbound message class handler."""

    def __init__(self, nats_cnx):
        """Create a new inbound messsage handler from a nats connection."""
        self.natsConn = nats_cnx

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
