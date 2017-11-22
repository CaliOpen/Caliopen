# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging
import base64
import ecdsa
import hashlib

from asn1crypto.core import Sequence, Integer

from zope.interface import implements, implementer
from pyramid.interfaces import IAuthenticationPolicy, IAuthorizationPolicy
from pyramid.security import Everyone, NO_PERMISSION_REQUIRED

from caliopen_main.user.core import User
from ..base.exception import AuthenticationError

log = logging.getLogger(__name__)


class EcdsaSignature(Sequence):
    """Asn.1 structure for an ECDSA signature."""
    _fields = [
        ('r', Integer),
        ('s', Integer)]


class AuthenticatedUser(object):
    """Represent an authenticated user."""

    def __init__(self, request):
        self.request = request
        self.user_id = None
        self.device_id = None
        self.shard_id = None
        self._check_user()
        # self._load_user()

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

        device_id = None
        device_header = self.request.headers.get('X-Caliopen-Device-ID', None)
        if device_header:
            device_id = device_header
            cache_key = '{}-{}'.format(user_id, device_id)
        else:
            raise AuthenticationError

        infos = self.request.cache.get(cache_key)

        if not infos:
            raise AuthenticationError
        if infos.get('access_token') != token:
            raise AuthenticationError
        if infos.get('user_status', 'unknown') in ['locked', 'maintenance']:
            raise AuthenticationError('Status {} does not permit operations'.
                                      format(infos.get('user_status')))

        if self.request.headers.get('X-Caliopen-Device-Signature', None):
            valid = self._validate_signature(self.request, device_id, infos)
            log.info('Signature verification for device %s: %r' %
                     (device_id, valid))

        self.user_id = user_id
        self.device_id = device_id
        self.shard_id = infos['shard_id']
        self.access_token = token
        self._user = None

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

    def _validate_signature(self, request, device_id, infos):
        """Validate device signature."""
        if infos['curve'] == 'P-256':
            curve = ecdsa.ecdsa.curve_256
            crv = ecdsa.curves.NIST256p
            hashfunc = hashlib.sha256
        else:
            log.warn('Unsupported curve %r' % infos['curve'])
            return False
        try:
            point = ecdsa.ellipticcurve.Point(curve, infos['x'], infos['y'])
        except AssertionError:
            log.warn('Invalid curve points')
            return False

        sign_header = request.headers.get('X-Caliopen-Device-Signature', None)
        if sign_header:
            data = '{}{}{}'.format(request.method, request.path_qs, '')
            try:
                b64_header = base64.decodestring(sign_header)
                ecdsasign = EcdsaSignature.load(b64_header)
                signature = ecdsasign['r'].contents + ecdsasign['s'].contents
                vk = ecdsa.VerifyingKey.from_public_point(point, crv,
                                                          hashfunc=hashfunc)
                return vk.verify(signature, data)
            except ecdsa.BadSignatureError:
                pass
            except Exception as exc:
                log.error('Exception during signature verification %r' % exc)
            return False
        else:
            log.warn('no device signature')
            return False

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

    @property
    def contact(self):
        self._load_user()
        return self._user.contact


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
