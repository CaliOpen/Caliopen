# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging
import base64

from zope.interface import implements, implementer
from pyramid.interfaces import IAuthenticationPolicy, IAuthorizationPolicy
from pyramid.security import Everyone, NO_PERMISSION_REQUIRED

from caliopen_main.user.core import User
from ..base.exception import AuthenticationError

log = logging.getLogger(__name__)


class AuthenticatedUser(object):
    """Represent an authenticated user."""

    def __init__(self, request):
        self.request = request
        self._check_user()
        self.pi_range = self._get_pi_range()

    def _check_user(self):
        if 'Authorization' not in self.request.headers:
            raise AuthenticationError

        authorization = self.request.headers['Authorization'].split()
        if authorization[0] != 'Bearer' and len(authorization) != 2:
            raise AuthenticationError

        log.debug('Authentication via Access Token')
        auth = base64.decodebytes(authorization[1].encode('utf-8')). \
            decode('utf-8')
        # authentication values is user_id:token
        if ':' not in auth:
            raise AuthenticationError

        user_id, token = auth.split(':')
        infos = self.request.cache.get(user_id)
        if not infos:
            raise AuthenticationError
        if infos.get('access_token') != token:
            raise AuthenticationError

        self.user_id = user_id
        self.access_token = token
        self._user = None

    def _get_pi_range(self):
        pi_range = self.request.headers.get('X-Caliopen-PI', None)
        if not pi_range:
            log.warn('No X-Caliopen-PI header')
            return (-1, -1)
        min_pi, max_pi = pi_range.split(';', 1)
        try:
            return (int(min_pi), int(max_pi))
        except ValueError:
            log.error('Invalid value for PI {}'.format(pi_range))
        except Exception as exc:
            log.error('Invalid range for PI {}: {}'.format(pi_range, exc))
        return (-1, -1)

    def _get_il_range(self):
        il_range = self.request.headers.get('X-Caliopen-IL', None)
        if not il_range:
            log.warn('No X-Caliopen-IL header')
            raise ValueError
        min_il, max_il = il_range.split(';', 1)
        try:
            return (int(min_il), int(max_il))
        except ValueError:
            log.error('Invalid value for IL {}'.format(il_range))
            raise ValueError
        except Exception as exc:
            log.error('Invalid range for IL {}: {}'.format(il_range, exc))
            raise exc

    def _load_user(self):
        if self._user:
            return
        self._user = User.get(self.user_id)

    @property
    def id(self):
        self._load_user()
        return self._user.user_id

    @property
    def username(self):
        self._load_user()
        return self._user.name


@implementer(IAuthenticationPolicy)
class AuthenticationPolicy(object):
    """Global authentication policy."""

    def authenticated_userid(self, request):
        if hasattr(request, '_CaliopenUser'):
            return request._CaliopenUser

        try:
            request._CaliopenUser = AuthenticatedUser(request)
        except AuthenticationError:
            return None

        return request._CaliopenUser

    def effective_principals(self, request):
        account = self.authenticated_userid(request)
        if not account:
            return [Everyone]
        return ["%s:%s" % (account.user_id, account.access_token)]

    def unauthenticated_userid(self, request):
        try:
            return AuthenticatedUser(request)
        except AuthenticationError:
            return None

    def remember(self, request, principal, **kw):
        """Token Key mechanism can't remember anyone."""
        return []

    def forget(self, request):
        return [('WWW-Authenticate', 'Bearer realm="Caliopen"')]


@implementer(IAuthorizationPolicy)
class AuthorizationPolicy(object):
    """Basic authorization policy."""

    def permits(self, context, principals, permission):
        """ Return an instance of
        :class:`pyramid.security.ACLAllowed` instance if the policy
        permits access, return an instance of
        :class:`pyramid.security.ACLDenied` if not."""
        if permission == NO_PERMISSION_REQUIRED:
            return True

        if not principals:
            False

        token = principals[0]
        if ':' in token and permission == 'authenticated':
            # All managed objects belong to authenticated user
            # no other policy to apply
            return True
        return False

    def principals_allowed_by_permission(self, context, permission):
        raise NotImplementedError
