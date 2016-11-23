# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging
import datetime

import colander
from pyramid.security import NO_PERMISSION_REQUIRED
from cornice.resource import resource, view

from ..base.context import DefaultContext
from .util import create_token

from caliopen_main.user.core import User
from ..base import Api
from ..base.exception import AuthenticationError

from caliopen_main.user.parameters import NewUser
from caliopen_main.user.returns import ReturnUser
from caliopen_storage.exception import NotFound

log = logging.getLogger(__name__)


class UserAuthenticationParameter(colander.MappingSchema):

    """Parameter for user authentication."""

    username = colander.SchemaNode(colander.String(), location='body')
    password = colander.SchemaNode(colander.String(), location='body')


@resource(path='',
          collection_path='/authentications',
          name='Authentication',
          schema=UserAuthenticationParameter,
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
        params = self.request.validated
        try:
            user = User.authenticate(params['username'], params['password'])
            log.info('Authenticate user {username}'.format(username=user.name))
        except Exception as exc:
            log.info('Authentication error for {name} : {error}'.
                     format(name=params['username'], error=exc))
            raise AuthenticationError()

        access_token = create_token()
        refresh_token = create_token(80)

        ttl = self.request.cache.client.ttl
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


class UserGetParameter(colander.MappingSchema):

    """Parameter to get user informations."""

    user_id = colander.SchemaNode(colander.String(), location='path')


class UserPostPararameter(colander.MappingSchema):

    """Parameter to create a new user."""

    username = colander.SchemaNode(colander.String(), location='body')
    password = colander.SchemaNode(colander.String(), location='body')


def no_such_user(request):
    """Validator that an user does not exist."""
    try:
        user = User.by_name(request.validated['username'])
        if user:
            raise AuthenticationError('User already exist')
    except NotFound:
        pass


@resource(path='/users/{user_id}',
          collection_path='/users',
          name='User',
          factory=DefaultContext)
class UserAPI(Api):

    """User API."""

    @view(renderer='json',
          permission='authenticated',
          schema=UserGetParameter)
    def get(self):
        """Get information about logged user."""
        user_id = self.request.validated['user_id']
        if user_id != self.request.authenticated_userid.user_id:
            raise AuthenticationError()
        user = User.get(user_id)
        return ReturnUser.build(user).serialize()

    @view(renderer='json',
          permission=NO_PERMISSION_REQUIRED,
          schema=UserPostPararameter,
          validators=no_such_user)
    def collection_post(self):
        """Create a new user."""

        param = NewUser({'name': self.request.validated['username'],
                         'password': self.request.validated['password']})
        try:
            user = User.create(param)
        except Exception as exc:
            raise AuthenticationError(exc.message)
        log.info('Created user {} with name {}'.
                 format(user.user_id, user.name))
        user_url = self.request.route_path('User', user_id=user.user_id)
        self.request.response.location = user_url.encode('utf-8')
        return {'location': user_url}


@resource(path='/me',
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
