# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging

from caliopen_storage.helpers.connection import connect_storage

from .renderer import TextPlainRenderer, JsonRenderer, PartRenderer
from .deserializer import json_deserializer

log = logging.getLogger(__name__)


def includeme(config):
    """Configure REST API."""
    connect_storage()
    config.commit()

    # configure renderers
    config.add_renderer('text_plain', TextPlainRenderer)
    config.add_renderer('json', JsonRenderer)
    config.add_renderer('simplejson', JsonRenderer)
    config.add_renderer('part', PartRenderer)

    # configure specific views for API errors
    config.scan('caliopen_api.base.errors')
    config.add_cornice_deserializer('application/json',
                                    json_deserializer)
    config.commit()
    log.info('Base API configured')
