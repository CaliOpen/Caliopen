# -*- coding: utf-8 -*-
"""
Caliopen API error formatting.

See https://caliopen.github.io/rfc/2016/04/18/errors-schema for reference.

Output structure for any error from API servier is:

{
  "errors": [
    {
      "description": "string",
      "type": "string",
      "values": ["string"],
      "property": "string",
      "component": "string",
      "code": "string"
    }
  ]
}
"""

from __future__ import absolute_import, print_function, unicode_literals

import logging
import sys
import traceback
import json

from pyramid.response import Response
from pyramid.view import view_config
from pyramid.exceptions import Forbidden
from pyramid.httpexceptions import (
    HTTPRequestTimeout,
    HTTPUnauthorized,
    HTTPInternalServerError,
    HTTPNotFound,
    HTTPConflict,
    HTTPMethodNotAllowed,
    HTTPServiceUnavailable,
    HTTPBadRequest,
    HTTPClientError,
    HTTPNotImplemented,
    HTTPUnprocessableEntity,
    HTTPExpectationFailed,
)
from pyramid_swagger.exceptions import RequestValidationError


log = logging.getLogger(__name__)


def format_response_detail(exc, request):
    """Format error details for a server error."""
    route = (request.matched_route.name
             if request.matched_route else ('Unknown'))
    return {'component': route,
            'values': exc.code,
            'property': exc.__class__.__name__}


def format_response(exc, request, details=None):
    """Format response error, details contains application errors."""
    # XXX better design for details as keys are not validated
    if not details:
        details = {'values': [exc.code],
                   'property': None,
                   'component': 'server'}
    error = {"errors": [{"description": exc.explanation,
                         "type": exc.title,
                         "values": details['values'],
                         "property": details['property'],
                         "component": details['component'],
                         "code": exc.code}]}
    response = Response(json.dumps(error))
    response.content_type = 'application/json'
    response.status_int = exc.code
    return response


@view_config(context=Forbidden)
def http_forbidden(exc, request):
    """Raise HTTPUnauthorized exception."""
    if request.authenticated_userid is None:
        exc = HTTPUnauthorized(explanation="Invalid credentials")
    return http_exception(exc, request)


@view_config(context=HTTPConflict)
@view_config(context=HTTPRequestTimeout)
@view_config(context=HTTPInternalServerError)
@view_config(context=HTTPNotFound)
@view_config(context=HTTPMethodNotAllowed)
@view_config(context=HTTPServiceUnavailable)
@view_config(context=HTTPClientError)
@view_config(context=HTTPNotImplemented)
@view_config(context=HTTPExpectationFailed)
def http_exception(exc, request):
    details = format_response_detail(exc, request)
    return format_response(exc, request, details)


@view_config(context=Exception)
def internal_server_error(exc, request):
    if isinstance(exc, Response):
        return exc
    details = format_response_detail(exc, request)
    response = format_response(exc, request, details)

    exc_type, exc_value, exc_tb = sys.exc_info()
    formatted_tb = traceback.format_exception(exc_type, exc_value, exc_tb)
    log.error('Unexpected error ''{}'': {}'.
              format(' '.join(formatted_tb), response))
    return response


@view_config(context=HTTPUnprocessableEntity)
@view_config(context=HTTPBadRequest)
def http_unprocessable_entity(exc, request):
    if isinstance(request.exc_info[1], RequestValidationError):
        # Formatter swagger validation errors
        exc = request.exc_info[1]
    details = format_response_detail(exc, request)
    return format_response(exc, request, details)
