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
logging.basicConfig(level=logging.INFO)


@tornado.gen.coroutine
def inbound_smtp_handler(config):
    """Inbound message NATS handler."""
    client = Nats()
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

@tornado.gen.coroutine
def inbound_twitter_handler(config):
    """Inbound twitterDM NATS handler"""
    client = Nats()
    server = 'nats://{}:{}'.format(config['host'], config['port'])
    servers = [server]

    opts = {"servers": servers}
    yield client.connect(**opts)

    # create and register subscriber(s)
    inbound_twitter_sub = subscribers.InboundTwitter(client)
    future = client.subscribe("inboundTwitter", "Twitterqueue",
                              inbound_twitter_sub.handler)
    log.info("nats subscription started for inboundTwitter")
    future.result()

@tornado.gen.coroutine
def inbound_mastodon_handler(config):
    """Inbound mastodonDM NATS handler"""
    client = Nats()
    server = 'nats://{}:{}'.format(config['host'], config['port'])
    servers = [server]

    opts = {"servers": servers}
    yield client.connect(**opts)

    # create and register subscriber(s)
    inbound_mastodon_sub = subscribers.InboundMastodon(client)
    future = client.subscribe("inboundMastodon", "Mastodonqueue",
                              inbound_mastodon_sub.handler)
    log.info("nats subscription started for inboundMastodon")
    future.result()

@tornado.gen.coroutine
def contact_handler(config):
    """NATS handler for contact update events."""
    client = Nats()
    server = 'nats://{}:{}'.format(config['host'], config['port'])
    servers = [server]

    def signale_handler():
        if nc.is_closed:
            return
        log.info('Disconnecting')
        loop.create_task(nc.close())

    # create and register subscriber(s)
    contact_subscriber = subscribers.ContactAction(client)
    future = client.subscribe("contactAction", "contactQueue",
                     contact_subscriber.handler)
    log.info("nats subscription started for contactAction")
    future.result()

    yield from nc.subscribe("contactAction", "contactQueue", process_contact)
    log.info('Subscribed to NATS contactAction')

@tornado.gen.coroutine
def key_handler(config):
    """NATS handler for discover_key events."""
    client = Nats()
    server = 'nats://{}:{}'.format(config['host'], config['port'])
    servers = [server]

    opts = {"servers": servers}
    yield client.connect(**opts)

    # create and register subscriber(s)
    key_subscriber = subscribers.KeyAction(client)
    future = client.subscribe("keyAction",
                              "keyQueue",
                              key_subscriber.handler)
    log.info("nats subscription started for keyAction")
    future.result()


if __name__ == '__main__':
    # load Caliopen config
    args = sys.argv
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', dest='conffile')
    kwargs = parser.parse_args(args[1:])
    kwargs = vars(kwargs)
    Configuration.load(kwargs['conffile'], 'global')
    connect_storage()
    inbound_smtp_handler(Configuration('global').get('message_queue'))
    inbound_twitter_handler(Configuration('global').get('message_queue'))
    inbound_mastodon_handler(Configuration('global').get('message_queue'))
    contact_handler(Configuration('global').get('message_queue'))
    key_handler(Configuration('global').get('message_queue'))
    loop_instance = tornado.ioloop.IOLoop.instance()
    loop_instance.start()
