# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from datetime import datetime
import logging

from cornice.resource import resource, view

from caliopen_main.message.core import (RawMessage, ReturnMessage,
                                        Message as CoreMessage)
from caliopen_main.message.parameters import NewMessage
from ..base import Api
from ..base.exception import ResourceNotFound

log = logging.getLogger(__name__)


@resource(collection_path='/discussions/{discussion_id}/messages',
          path='/discussions/{discussion_id}/messages/{message_id}')
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
        discussion_id = self.request.matchdict.get('discussion_id')
        pi_range = self.request.authenticated_userid.pi_range
        messages = CoreMessage.by_discussion_id(self.user, discussion_id,
                                            min_pi=pi_range[0],
                                            max_pi=pi_range[1],
                                            limit=self.get_limit(),
                                            offset=self.get_offset())
        results = []
        for msg in messages['hits']:
            results.append(ReturnMessage.build(msg).serialize())
        return {'messages': results, 'total': messages['total']}

    @view(renderer='json', permission='authenticated')
    def collection_post(self):
        discussion_id = self.request.matchdict.get('discussion_id')
        reply_to = self.request.json.get('reply_to')
        if reply_to:
            parent = CoreMessage.get(self.user, reply_to)
            parent_message_id = parent.external_id
            discussion_id = parent.discussion_id
            pi_value = parent.privacy_index
        else:
            parent_message_id = None
            discussion_id = None
            # XXX : how to compute ?
            pi_value = 0
        recipients = self.extract_recipients()
        # XXX : make recipient for UserMessage using Recipient class
        subject = self.request.json.get('subject')
        text = self.request.json.get('text')
        tags = self.request.json.get('tags', [])
        new_msg = NewMessage(recipients,
                             subject=subject,
                             text=text, tags=tags,
                             date=datetime.utcnow(),
                             privacy_index=pi_value,
                             thread_id=discussion_id,
                             parent_message_id=parent_message_id)
        msg = CoreMessage.create(self.user, new_msg)
        idx_msg = CoreMessage.get(self.user, msg.message_id)
        log.info('Post new message %r' % msg.message_id)
        # XXX return redirect to newly created message ?
        return idx_msg


@resource(path='/raws/{ext_msg_id_sum256}')
class Raw(Api):
    """returns a raw message from the given sum256 of the external_message_id"""
    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='text_plain', permission='authenticated')
    def get(self):
        # XXX how to check privacy_index ?
        raw_id = self.request.matchdict.get('ext_msg_id_sum256')
        raw = RawMessage.get(self.user, raw_id)
        if raw:
            return raw.data
        raise ResourceNotFound('No such message')
