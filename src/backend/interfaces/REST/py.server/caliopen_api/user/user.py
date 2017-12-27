# -*- coding: utf-8 -*-
"""Caliopen user API."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import datetime

from pyramid.security import NO_PERMISSION_REQUIRED
from cornice.resource import resource, view

import tornado.ioloop
import tornado.gen
from nats.io import Client as Nats
import json

from ..base.context import DefaultContext
from .util import create_token

from ..base import Api
from ..base.exception import AuthenticationError, NotAcceptable
from ..base.exception import Unprocessable, ValidationError

from caliopen_storage.exception import NotFound
from caliopen_storage.config import Configuration
from caliopen_main.common.core import PublicKey
from caliopen_main.user.core import User
from caliopen_main.user.parameters import NewUser, Settings
from caliopen_main.user.returns.user import ReturnUser
from caliopen_main.contact.parameters import NewContact, NewEmail
from caliopen_main.device.core import Device

log = logging.getLogger(__name__)


def get_device_sig_key(user, device):
    """Get device signature key."""
    keys = PublicKey._model_class.filter(user_id=user.user_id,
                                         resource_id=device.device_id)
    keys = [x for x in keys if x.resource_type == 'device' and
            x.use == 'sig']
    if keys:
        return keys[0]
    return None


def patch_device_key(key, param):
    """Patch a device signature public key as X and Y points are not valid."""
    if not key.x and not key.y:
        key.x = int(param['ecdsa_key']['x'], 16)
        key.y = int(param['ecdsa_key']['y'], 16)
        key.save()
        return True
    return False


def make_user_device_tokens(request, user, device, key, ttl=86400):
    """Return (key, tokens) informations for cache entry management."""
    cache_key = '{}-{}'.format(user.user_id, device.device_id)

    previous = request.cache.get(cache_key)
    if previous:
        status = previous.get('user_status', 'unknown')
        log.info('Found current user device entry {} : {}'.
                 format(cache_key, status))
        if status in ['locked', 'maintenance']:
            raise AuthenticationError('Status {} does not permit operations'.
                                      format(status))

    access_token = create_token()
    refresh_token = create_token(80)

    expires_at = (datetime.datetime.utcnow() +
                  datetime.timedelta(seconds=ttl))

    tokens = {'access_token': access_token,
              'refresh_token': refresh_token,
              'expires_in': ttl,  # TODO : remove this value
              'shard_id': user.shard_id,
              'expires_at': expires_at.isoformat(),
              'user_status': 'active',
              'key_id': str(key.key_id),
              'x': key.x,
              'y': key.y,
              'curve': key.crv}

    request.cache.set(cache_key, tokens)
    result = tokens.copy()
    result.pop('shard_id')
    return result


@resource(path='',
          collection_path='/api/v1/authentications',
          name='Authentication',
          factory=DefaultContext
          )
class AuthenticationAPI(Api):
    """User authentication API."""

    @view(renderer='json', permission=NO_PERMISSION_REQUIRED)
    def collection_post(self):
        """
        Api for user authentication.

        Store generated tokens in a cache entry related to user_id
        and return a structure with this tokens for client usage.
        """
        params = self.request.json
        try:
            user = User.authenticate(params['username'], params['password'])
            log.info('Authenticate user {username}'.format(username=user.name))
        except Exception as exc:
            log.info('Authentication error for {name} : {error}'.
                     format(name=params['username'], error=exc))
            raise AuthenticationError(detail=exc.message)
        # Device management
        in_device = self.request.swagger_data['authentication']['device']
        key = None
        if in_device:
            try:
                device = Device.get(user, in_device['device_id'])
                log.info("Found device %s" % device.device_id)
                # Found a device, check if signature public key have X and Y
                key = get_device_sig_key(user, device)
                if not key:
                    log.error('No signature key found for device %r'
                              % device.device_id)
                else:
                    if patch_device_key(key, in_device):
                        log.info('Patch device key OK')
                    else:
                        log.warn('Patch device key does not work')
            except NotFound:
                devices = Device.find(user)
                if devices.get('objects', []):
                    in_device['status'] = 'unverified'
                else:
                    in_device['name'] = 'default'
                # we must declare a new device
                device = Device.create_from_parameter(user, in_device,
                                                      self.request.headers)
                log.info("Created device %s" % device.device_id)
                key = get_device_sig_key(user, device)
                if not key:
                    log.error('No signature key found for device %r'
                              % device.device_id)

        else:
            raise ValidationError(detail='No device informations')
        try:
            device.login(self.request.headers.get('X-Forwarded-For'))
        except Exception as exc:
            log.exception('Device login failed: {0}'.format(exc))

        tokens = make_user_device_tokens(self.request, user, device, key)
        return {'user_id': user.user_id,
                'username': user.name,
                'tokens': tokens,
                'device': {'device_id': device.device_id,
                           'status': device.status}}


def no_such_user(request):
    """Validator that an user does not exist."""
    username = request.swagger_data['user']['username']
    if not User.is_username_available(username):
        raise NotAcceptable(detail='User already exist')


@resource(path='/api/v1/users/{user_id}',
          collection_path='/api/v1/users',
          name='User',
          factory=DefaultContext)
class UserAPI(Api):
    """User API."""

    @view(renderer='json',
          permission=NO_PERMISSION_REQUIRED,
          validators=no_such_user)
    def collection_post(self):
        """Create a new user."""
        settings = Settings()
        settings.import_data(self.request.swagger_data['user']['settings'])
        try:
            settings.validate()
        except Exception as exc:
            raise Unprocessable(detail=exc.message)

        param = NewUser({'name': self.request.swagger_data['user']['username'],
                         'password': self.request.swagger_data['user'][
                             'password'],
                         'recovery_email': self.request.swagger_data['user'][
                             'recovery_email'],
                         'settings': settings,
                         })

        if self.request.swagger_data['user']['contact'] is not None:
            param.contact = self.request.swagger_data['user']['contact']
        else:
            c = NewContact()
            c.given_name = param.name
            c.family_name = ""  # can't guess it !
            email = NewEmail()
            email.address = param.recovery_email
            c.emails = [email]
            param.contact = c

        try:
            user = User.create(param)
        except Exception as exc:
            log.exception('Error during user creation {0}'.format(exc))
            raise NotAcceptable(detail=exc.message)

        log.info('Created user {} with name {}'.
                 format(user.user_id, user.name))
        # default device management
        in_device = self.request.swagger_data['user']['device']
        if in_device:
            try:
                in_device['name'] = 'default'
                device = Device.create_from_parameter(user, in_device,
                                                      self.request.headers)
                log.info('Device %r created' % device.device_id)
            except Exception as exc:
                log.exception('Error during default device creation %r' % exc)
        else:
            log.warn('Missing default device parameter')
        user_url = self.request.route_path('User', user_id=user.user_id)
        self.request.response.location = user_url.encode('utf-8')

        # send notification to apiv2 to trigger post-registration actions
        config = Configuration('global').get("message_queue")
        try:
            tornado.ioloop.IOLoop.current().run_sync(
                lambda: notify_new_user(user, config), timeout=5)
        except Exception as exc:
            log.exception(
                'Error when sending new_user notification on NATS : {0}'.
                format(exc))

        return {'location': user_url}


@resource(path='/api/v1/me',
          name='MeUser',
          factory=DefaultContext)
class MeUserAPI(Api):
    """Me API."""

    @view(renderer='json',
          permission='authenticated')
    def get(self):
        """Get information about logged user."""
        user_id = self.request.authenticated_userid.user_id
        user = User.get(user_id)
        return ReturnUser.build(user).serialize()


@tornado.gen.coroutine
def notify_new_user(user, config):
    client = Nats()
    server = 'nats://{}:{}'.format(config['host'], config['port'])
    opts = {"servers": [server]}
    yield client.connect(**opts)
    notif = {
        'message': 'created',
        'user_name': '{0}'.format(user.name),
        'user_id': '{0}'.format(user.user_id)
    }
    yield client.publish('userAction', json.dumps(notif))
    yield client.flush()
    log.info("New user notification sent on NATS for {0}".format(user.user_id))
