# -*- coding: utf-8 -*-
"""Specific API exception to be process with Specific view."""
from __future__ import absolute_import, print_function, unicode_literals
from pyramid.httpexceptions import HTTPClientError
from caliopen_storage.exception import NotFound
from caliopen_main.errors import (PatchUnprocessable, PatchError,
                                  PatchConflict)

import logging
log = logging.getLogger(__name__)


class ValidationError(HTTPClientError):
    """
    subclass of :class:`~HTTPClientError`

    This indicates that the body or headers failed validity checks,
    preventing the server from being able to continue processing.

    code: 400, title: Bad Request
    """
    code = 400
    title = 'Bad Request'
    explanation = ('The server could not comply with the request since '
                   'it is either malformed or otherwise incorrect.')


class AuthenticationError(HTTPClientError):
    """
    subclass of :class:`~HTTPClientError`

    This indicates that the user authentication failed.

    code: 401, title: Unauthorized
    """
    code = 401
    title = 'Authentication error'
    explanation = 'Wrong credentials (e.g., bad password or username)'


class AuthorizationError(HTTPClientError):
    code = 403
    title = 'Forbidden'
    explanation = 'Access was denied to this resource.'

    def __init__(self, detail=None, headers=None, comment=None,
                 body_template=None, result=None, **kw):
        HTTPClientError.__init__(self, detail=detail, headers=headers,
                                 comment=comment, body_template=body_template,
                                 **kw)
        self.result = result


class ResourceNotFound(HTTPClientError):
    code = 404
    title = 'Not Found'
    explanation = 'The resource could not be found.'


class MethodNotAllowed(HTTPClientError):
    code = 405
    title = 'Method not allowed'
    explanation = 'The method is not allowed or not yet implemented'


class MergePatchError(HTTPClientError):
    def __init__(self, error=None):
        if isinstance(error, NotFound):
            self.code = 404
            self.title = "Not Found"
            self.explanation = "The resource could not be found to apply PATCH"
            self.message = error.message
        if isinstance(error, PatchUnprocessable):
            self.code = 422
            self.title = "Patch Unprocessable"
            self.explanation = "PATCH payload was malformed or unprocessable"
            self.message = error.message
        if isinstance(error, PatchError):
            self.code = 422
            self.title = "Patch Error"
            self.explanation = "Application encountered an error when " \
                               "applying patch"
            self.message = error.message
        if isinstance(error, PatchConflict):
            self.code = 409
            self.title = "Patch Conflict"
            self.explanation = "The request cannot be applied given " \
                               "the state of the resource"
            self.message = error.message


class Unprocessable(HTTPClientError):
    """
    subclass of :class:`~HTTPClientError`

    This indicates that the body or headers failed validity checks,
    preventing the server from being able to continue processing.

    code: 422, title: Bad Request
    """

    def __init__(self, error=None):
            
        self.code = 422
        self.title = 'Unprocessable entity'
        self.explanation = ('The server encounter when processing payload')
        self.message = error.message
