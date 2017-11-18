# -*- coding: utf-8 -*-
"""Caliopen NATS listener for message processing."""
from __future__ import absolute_import, print_function, unicode_literals

import argparse
import sys
import logging

import tornado.ioloop
import tornado.gen
from nats.io import Client as Nats

from caliopen_storage.config import Configuration
from caliopen_storage.helpers.connection import connect_storage

log = logging.getLogger(__name__)

logging.basicConfig(level=logging.DEBUG)


@tornado.gen.coroutine
def inbound_handler(config):
    """Inbound message NATS handler."""
    client = Nats()
    server = 'nats://{}:{}'.format(config['host'], config['port'])
    servers = [server]

    opts = {"servers": servers}
    yield client.connect(**opts)

    # create and register subscriber(s)
    inbound_email_sub = subscribers.InboundEmail(client)
    future = client.subscribe("inboundSMTP", "SMTPqueue",
                              inbound_email_sub.handler)
    future = client.subscribe("inboundIMAP", "IMAPqueue",
                              inbound_email_sub.handler)
    log.info("nats subscription started")
    future.result()


if __name__ == '__main__':
    # load Caliopen config
    args = sys.argv
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', dest='conffile')
    kwargs = parser.parse_args(args[1:])
    kwargs = vars(kwargs)
    Configuration.load(kwargs['conffile'], 'global')
    # need to load config before importing subscribers
    import subscribers

    connect_storage()
    inbound_handler(Configuration('global').get('message_queue'))
    loop_instance = tornado.ioloop.IOLoop.instance()
    loop_instance.start()
