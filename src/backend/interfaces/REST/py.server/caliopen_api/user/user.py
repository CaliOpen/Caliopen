# -*- coding: utf-8 -*-
"""Caliopen user API."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import datetime

from pyramid.security import NO_PERMISSION_REQUIRED
from cornice.resource import resource, view

from ..base.context import DefaultContext
from .util import create_token

from ..base import Api
from ..base.exception import AuthenticationError, NotAcceptable, Unprocessable

from caliopen_main.user.core import User
from caliopen_main.user.parameters import NewUser, NewRemoteIdentity, Settings
from caliopen_main.user.returns.user import ReturnUser, ReturnRemoteIdentity
from caliopen_main.contact.parameters import NewContact, NewEmail

log = logging.getLogger(__name__)


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

        access_token = create_token()
        refresh_token = create_token(80)

        # ttl = self.request.cache.client.ttl
        # TODO: remove this ttl to go back to cache.client
        ttl = 86400
        expires_at = (datetime.datetime.utcnow() +
                      datetime.timedelta(seconds=ttl))
        tokens = {'access_token': access_token,
                  'refresh_token': refresh_token,
                  'expires_in': ttl,  # TODO : remove this value
                  'expires_at': expires_at.isoformat()}
        self.request.cache.set(user.user_id, tokens)

        return {'user_id': user.user_id,
                'username': user.name,
                'tokens': tokens}


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
            raise NotAcceptable(detail=exc.message)

        log.info('Created user {} with name {}'.
                 format(user.user_id, user.name))
        user_url = self.request.route_path('User', user_id=user.user_id)
        self.request.response.location = user_url.encode('utf-8')
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


@resource(path='/api/v1/identities/remotes/{identifier}',
          collection_path='/api/v1/identities/remotes',
          name='RemoteIdentities',
          factory=DefaultContext)
class RemoteIdentityAPI(Api):
    """User remote identities dead simple API."""

    @view(renderer='json',
          permission='authenticated')
    def collection_post(self):
        """Get information about logged user."""
        user_id = self.request.authenticated_userid.user_id
        user = User.get(user_id)
        data = self.request.swagger_data['identity']
        param = NewRemoteIdentity({'display_name': data['display_name'],
                                   'identifier': data['identifier'],
                                   'type': data['type'],
                                   'status': data.get('status', 'active'),
                                   'infos': data['infos']
                                   })
        param.validate()
        identity = user.add_remote_identity(param)
        identity_url = self.request.route_path('RemoteIdentities',
                                               identifier=identity.identity_id)
        self.request.response.location = identity_url.encode('utf-8')
        return {'location': identity_url}

    @view(renderer='json',
          permission='authenticated')
    def get(self):
        """Get information about logged user."""
        user_id = self.request.authenticated_userid.user_id
        user = User.get(user_id)
        identifier = self.request.swagger_data['identifier']
        identity = user.get_remote_identity(identifier)
        return ReturnRemoteIdentity.build(identity).serialize()
