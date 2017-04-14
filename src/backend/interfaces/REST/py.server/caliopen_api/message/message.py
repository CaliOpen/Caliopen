# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from datetime import datetime
import logging

from cornice.resource import resource, view
from pyramid.response import Response

from caliopen_main.objects.message import Message as ObjectMessage
from caliopen_main.message.core.raw import RawMessage
from caliopen_storage.exception import NotFound

from ..base import Api

from ..base.exception import (ResourceNotFound,
                              ValidationError,
                              MethodNotAllowed,
                              MergePatchError)
from pyramid.httpexceptions import HTTPServerError

log = logging.getLogger(__name__)


@resource(collection_path='/messages',
          path='/messages/{message_id}')
class Message(Api):
    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    def extract_recipients(self):
        """Get recipients from request"""
        recipients = {}
        for rec_type in ['to_recipients', 'cc_recipients', 'bcc_recipients']:
            addrs = []
            for rec in self.request.json.get(rec_type, []):
                addrs.append((rec['contact'], rec['address']))
            recipients[rec_type] = addrs
        recipients['from'] = [(self.user.user_id, self.user.user_id)]
        return recipients

    @view(renderer='json', permission='authenticated')
    def collection_get(self):
        discussion_id = self.request.swagger_data['discussion_id']
        pi_range = self.request.authenticated_userid.pi_range
        messages = ObjectMessage.by_discussion_id(self.user, discussion_id,
                                                  min_pi=pi_range[0],
                                                  max_pi=pi_range[1],
                                                  limit=self.get_limit(),
                                                  offset=self.get_offset())
        results = []
        log.warn('Got result {}'.format(messages))
        for msg in messages['hits']:
            results.append(msg.marshall_json_dict())
        return {'messages': results, 'total': messages['total']}

    @view(renderer='json', permission='authenticated')
    def collection_post(self):
        data = self.request.json
        # ^ json payload should have been validated by swagger module
        try:
            message = ObjectMessage().create_draft(user_id=self.user.user_id,
                                                   **data)
        except Exception as exc:
            log.warn(exc)
            raise MergePatchError(exc)

        message_url = self.request.route_path('message',
                                              message_id=str(
                                                  message.message_id))

        self.request.response.location = message_url.encode('utf-8')
        return {'location': message_url}

    @view(renderer='json', permission='authenticated')
    def get(self):
        # pi_range = self.request.authenticated_userid.pi_range
        message_id = self.request.swagger_data["message_id"]
        message = ObjectMessage(self.user.user_id, message_id=message_id)
        try:
            message.get_db()
        except NotFound:
            raise ResourceNotFound

        message.unmarshall_db()
        return message.marshall_json_dict()

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

        message = ObjectMessage(self.user.user_id, message_id=message_id)
        error = message.patch_draft(patch, db=True, index=True)
        if error is not None:
            raise MergePatchError(error)

        return Response(None, 204)

    @view(renderer='json', permission='authenticated')
    def delete(self):
        message_id = self.request.swagger_data["message_id"]
        message = ObjectMessage(self.user.user_id, message_id=message_id)

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
