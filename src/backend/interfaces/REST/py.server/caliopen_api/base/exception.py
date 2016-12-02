# -*- coding: utf-8 -*-
"""Specific API exception to be process with Specific view."""
from __future__ import absolute_import, print_function, unicode_literals
from pyramid.httpexceptions import HTTPClientError


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
    explanation = ('Wrong credentials (e.g., bad password or username)')


class AuthorizationError(HTTPClientError):

    code = 403
    title = 'Forbidden'
    explanation = ('Access was denied to this resource.')
    def __init__(self, detail=None, headers=None, comment=None,
                 body_template=None, result=None, **kw):
        HTTPClientError.__init__(self, detail=detail, headers=headers,
                                 comment=comment, body_template=body_template,
                                 **kw)
        self.result = result


class ResourceNotFound(HTTPClientError):

    code = 404
    title = 'Not Found'
    explanation = ('The resource could not be found.')
