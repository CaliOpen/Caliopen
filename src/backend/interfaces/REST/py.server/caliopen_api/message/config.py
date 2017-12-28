# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging

log = logging.getLogger(__name__)


def includeme(config):
    """
    Serve message and discussion REST API.
    """

    config.commit()

    # Activate cornice in any case and scan
    log.debug('Loading message API')
    config.scan('caliopen_api.message.message')
