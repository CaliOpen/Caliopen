# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging

from pyramid.httpexceptions import HTTPExpectationFailed

from caliopen_storage.helpers.connection import connect_storage

from .renderer import TextPlainRenderer, JsonRenderer, PartRenderer
from .deserializer import json_deserializer
from .exception import (ValidationError, AuthenticationError,
                        AuthorizationError, ResourceNotFound)

log = logging.getLogger(__name__)


def format_error(exc, request, code, name):
    """Format error message in a structure."""
    msg = exc.args[0] if exc.args else ""
    data = {'code': code, 'name': name, 'message': msg}
    request.response.status_int = code
    return {'error': data}


def validation_error(exc, request):
    """Raise HTTP 400."""
    return format_error(exc, request, 400, 'Validation error')


def authentication_error(exc, request):
    """Raise HTTP 401."""
    return format_error(exc, request, 401, 'Authentication error')


def authorization_error(exc, request):
    """Raise HTTP 403."""
    return format_error(exc, request, 403, 'Authorization error')


def resource_not_found_error(exc, request):
    """Raise HTTP 404."""
    return format_error(exc, request, 404, 'Resource not found')


def expectation_failed(exc, request):
    """Raise HTTP 417."""
    return format_error(exc, request, 417, 'Expectation failed')


def internal_server_error(exc, request):
    """Raise HTTP 500 correctly."""
    return format_error(exc, request, 404, 'Internal server error')


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
    config.add_view(validation_error,
                    context=ValidationError,
                    renderer='simplejson')
    config.add_view(authentication_error,
                    context=AuthenticationError,
                    renderer='simplejson')
    config.add_view(authorization_error,
                    context=AuthorizationError,
                    renderer='simplejson')
    config.add_view(resource_not_found_error,
                    context=ResourceNotFound,
                    renderer='simplejson')
    config.add_view(expectation_failed,
                    context=HTTPExpectationFailed,
                    renderer='simplejson')
    # config.add_view(internal_server_error,
    #                context=HTTPServerError,
    #                render='simplejson')
    config.add_cornice_deserializer('application/json',
                                    json_deserializer)
    config.add_static_view('doc/api', 'caliopen_api:../../../../../../doc/api/', cache_max_age=3600)
    config.add_static_view('api-ui', 'caliopen_api:../../../../../../devtools/swagger-ui/', cache_max_age=3600)
    config.commit()
    log.info('Base API configured')
