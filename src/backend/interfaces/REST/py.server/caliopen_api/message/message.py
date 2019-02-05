# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging

from cornice.resource import resource, view
from pyramid.response import Response

from caliopen_main.message.objects.message import Message as ObjectMessage
from caliopen_main.message.core import RawMessage
from caliopen_storage.exception import NotFound

from ..base import Api

from ..base.exception import (ResourceNotFound,
                              MergePatchError)
from pyramid.httpexceptions import HTTPServerError, HTTPMovedPermanently
from caliopen_main.common.core.feature import marshal_features

log = logging.getLogger(__name__)


@resource(collection_path='/messages',
          path='/messages/{message_id}')
class Message(Api):
    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='json', permission='authenticated')
    def collection_get(self):
        log.warn('Deprecated GET /messages API')
        raise HTTPMovedPermanently(location="/V2/messages")

    @view(renderer='json', permission='authenticated')
    def collection_post(self):
        data = self.request.json
        if 'privacy_features' in data:
            features = marshal_features(data['privacy_features'])
            data['privacy_features'] = features
        # ^ json payload should have been validated by swagger module
        try:
            message = ObjectMessage.create_draft(user=self.user, **data)
        except Exception as exc:
            log.exception(exc)
            raise MergePatchError(error=exc)

        message_url = self.request.route_path('message',
                                              message_id=str(
                                                  message.message_id))
        message_url = message_url.replace("/v1/", "/v2/")

        self.request.response.location = message_url.encode('utf-8')
        return {'location': message_url}

    @view(renderer='json', permission='authenticated')
    def get(self):
        log.warn('Deprecated GET /messages/<id> API')
        message_id = self.request.swagger_data["message_id"]
        message_url = self.request.route_path('message', message_id=message_id)
        message_url = message_url.replace("/v1/", "/v2/")
        raise HTTPMovedPermanently(location=message_url)

    @view(renderer='json', permission='authenticated')
    def patch(self):
        """Update a message with payload.

        method follows the rfc5789 PATCH and rfc7396 Merge patch specifications,
        + 'current_state' caliopen's specs.
        stored messages are modified according to the fields within the payload,
        ie payload fields squash existing db fields, no other modification done.
        If message doesn't existing, response is 404.
        If payload fields are not conform to the message db schema, response is
        422 (Unprocessable Entity).
        Successful response is 204, without a body.
        """
        message_id = self.request.swagger_data["message_id"]
        patch = self.request.json
        if 'privacy_features' in patch:
            features = marshal_features(patch['privacy_features'])
            patch['privacy_features'] = features
        if 'privacy_features' in patch.get('current_state', {}):
            current = patch['current_state']['privacy_features']
            features = marshal_features(current)
            patch['current_state']['privacy_features'] = features

        message = ObjectMessage(user=self.user, message_id=message_id)
        try:
            message.patch_draft(self.user, patch, db=True, index=True,
                                with_validation=True)
        except Exception as exc:
            raise MergePatchError(exc)

        return Response(None, 204)

    @view(renderer='json', permission='authenticated')
    def delete(self):
        message_id = self.request.swagger_data["message_id"]
        message = ObjectMessage(user=self.user, message_id=message_id)

        try:
            message.get_db()
            message.get_index()
        except NotFound:
            raise ResourceNotFound

        try:
            message.delete_db()
            message.delete_index()
        except Exception as exc:
            raise HTTPServerError(exc)

        return Response(None, 204)


@resource(path='/raws/{raw_msg_id}')
class Raw(Api):
    """returns a raw message"""

    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='text_plain', permission='authenticated')
    def get(self):
        # XXX how to check privacy_index ?
        raw_msg_id = self.request.matchdict.get('raw_msg_id')
        raw = RawMessage.get_for_user(self.user.user_id, raw_msg_id)
        if raw:
            return raw.raw_data
        raise ResourceNotFound('No such message')
