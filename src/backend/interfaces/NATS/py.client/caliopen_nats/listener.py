# -*- coding: utf-8 -*-
"""Caliopen NATS listener for message processing."""
from __future__ import absolute_import, print_function, unicode_literals

import argparse
import sys
import logging
import json
import asyncio

from nats.aio.client import Client as Nats
from nats.aio.errors import ErrConnectionClosed, ErrTimeout, ErrNoServers

from caliopen_storage.config import Configuration
from caliopen_storage.helpers.connection import connect_storage

log = logging.getLogger(__name__)


def run(loop):
    """Run NATS subscribers."""
    from caliopen_main.user.core import User
    from caliopen_main.contact.objects import Contact
    from caliopen_nats.delivery import UserMessageDelivery
    from caliopen_pi.qualifiers import ContactMessageQualifier

    nc = Nats()
    config = Configuration('global').get('message_queue')
    server = 'nats://{}:{}'.format(config['host'], config['port'])
    servers = [server]
    try:
        yield from nc.connect(servers=servers, io_loop=loop)
        log.info('Connected to NATS {}'.format(servers))
    except ErrNoServers:
        log.error('No NATS server available')
        sys.exit(1)

    def process_raw_message(msg, payload):
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
            yield from nc.publish(msg.reply, json.dumps(nats_success))
        except Exception as exc:
            log.error("deliver process failed : {}".format(exc))
            nats_error['error'] = str(exc.message)
            yield from nc.publish(msg.reply, json.dumps(nats_error))

    @asyncio.coroutine
    def process_message(msg):
        payload = json.loads(msg.data.decode())
        if payload['order'] == 'process_raw':
            process_raw_message(msg, payload)
        else:
            log.warn('Invalid order type {} for message processing'.
                     format(payload['order']))

    def process_contact_update(msg, payload):
        """Process a contact update message."""
        # XXX validate payload structure
        if 'user_id' not in payload or 'contact_id' not in payload:
            raise Exception('Invalid contact_update structure')
        log.debug('Will process payload {}'.format(payload))
        try:
            user = User.get(payload['user_id'])
            contact = Contact(user.user_id, contact_id=payload['contact_id'])
            contact.get_db()
            contact.unmarshall_db()
            qualifier = ContactMessageQualifier(user)
            log.info('Will process update for contact {0} of user {1}'.
                     format(contact.contact_id, user.user_id))
            qualifier.process(contact)
        except Exception as exc:
            log.exception('Got exception {}'.format(exc))
            return False
        return True

    @asyncio.coroutine
    def process_contact(msg):
        """Handle an process_raw nats messages."""
        payload = json.loads(msg.data)
        # log.info('Get payload order {}'.format(payload['order']))
        if payload['order'] == "contact_update":
            process_contact_update(msg, payload)
        else:
            log.warn('Unhandled payload type {}'.format(payload['order']))

    def signale_handler():
        if nc.is_closed:
            return
        log.info('Disconnecting')
        loop.create_task(nc.close())

    yield from nc.subscribe("inboundSMTP", "SMTPqueue", process_message)
    log.info('Subscribed to NATS inboundSMTP')

    yield from nc.subscribe("contactAction", "contactQueue", process_contact)
    log.info('Subscribed to NATS contactAction')

if __name__ == '__main__':
    # load Caliopen config
    args = sys.argv
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', dest='conffile')
    kwargs = parser.parse_args(args[1:])
    kwargs = vars(kwargs)
    Configuration.load(kwargs['conffile'], 'global')
    connect_storage()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run(loop))
    try:
        loop.run_forever()
    finally:
        loop.close()
