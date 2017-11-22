# -*- coding: utf-8 -*-
"""Caliopen pyramid renderer."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import datetime
import pytz
from rfc3339 import rfc3339
from uuid import UUID
from decimal import Decimal

import simplejson as json
from zope.interface import implementer
from pyramid.interfaces import ITemplateRenderer


log = logging.getLogger(__name__)


@implementer(ITemplateRenderer)
class TextPlainRenderer(object):

    def __init__(self, request):
        self.request = request

    def __call__(self, value, system):
        request = system['request']
        request.response.content_type = b'text/plain'
        return value


class JSONEncoder(json.JSONEncoder):

    def default(self, obj):
        '''Convert object to JSON encodable type.'''
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime.datetime):
            if obj.tzinfo is None:
                return rfc3339(obj.replace(tzinfo=pytz.utc))
        if isinstance(obj, datetime.date):
            return rfc3339(obj)
        if isinstance(obj, UUID):
            return str(obj)
        return super(JSONEncoder, self).default(obj)


@implementer(ITemplateRenderer)
class JsonRenderer(object):
    """
    Template Factory for render json that accept datetime and decimal.
    """

    def __init__(self, _renderer_helper):
        pass

    def __call__(self, data, context):
        acceptable = ('application/json', 'text/json', 'text/plain')
        response = context['request'].response
        content_type = (context['request'].accept.best_match(acceptable)
                        or acceptable[0])
        response.content_type = str(content_type)
        return json.dumps(data, cls=JSONEncoder)


@implementer(ITemplateRenderer)
class PartRenderer(object):
    """
    Renderer for a message part, content type is defined in the part
    """

    def __init__(self, request):
        self.request = request

    def __call__(self, part, context):
        response = context['request'].response
        response.content_type = part['part'].content_type.encode('utf-8')
        return part['part'].payload.encode('utf-8')
