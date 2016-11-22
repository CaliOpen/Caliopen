# -*- coding: utf-8 -*-
"""
The Root Context

used when a view did not declare it's own context.
"""
from __future__ import absolute_import, print_function, unicode_literals

from pyramid.security import (Everyone, Authenticated, Allow,
                              NO_PERMISSION_REQUIRED, ALL_PERMISSIONS,
                              )
from pyramid.decorator import reify


class DefaultContext(object):

    """A default request context."""

    default_acl = [(Allow, Everyone, NO_PERMISSION_REQUIRED),
                   (Allow, Authenticated, 'authenticated'),
                   ]

    def __init__(self, request):
        self.request = request
        self.return_schema = None
        self._acl = DefaultContext.default_acl[:]

    @reify
    def authenticated_user(self):
        """
        Return the authenticated user.

        :return: authenticated user
        :rtype: dict
        """
        user = self.request.authenticated_userid
        return user

    @reify
    def __acl__(self):
        return self._acl

    def append_acl(self, role, rights):
        self._acl.append((Allow, role, rights))
