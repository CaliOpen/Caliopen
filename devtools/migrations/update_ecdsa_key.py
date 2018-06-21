#!/usr/bin/env python
# coding: utf8
"""Extract recovery emails of registered users."""

from __future__ import unicode_literals

import argparse
import logging

from caliopen_storage.config import Configuration
from caliopen_storage.helpers.connection import connect_storage

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', dest='conffile')

    args = parser.parse_args()
    Configuration.load(args.conffile, 'global')
    connect_storage()
    from caliopen_main.common.store import PublicKey
    keys = PublicKey.all()
    cpt = 0
    for key in keys:
        if key.resource_type == 'device' and key.use == 'sig':
            key.x = None
            key.y = None
            log.info('Updating key %r' % key.key_id)
            key.save()
            cpt += 1
    log.info('Update of %d keys' % cpt)
