# -*- coding: utf-8 -*-
"""Caliopen core discussion related classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid
from datetime import datetime

from caliopen_storage.exception import NotFound
from caliopen_storage.core import BaseUserCore
from caliopen_storage.parameters import ReturnCoreObject

from ..store.discussion import \
    (DiscussionExternalLookup as ModelExternalLookup,
     DiscussionRecipientLookup as ModelRecipientLookup,
     DiscussionMessageLookup as ModelMessageLookup,
     Discussion as ModelDiscussion)
from ..store.discussion_index import \
    DiscussionIndexManager as DIM

from caliopen_main.discussion.parameters import Discussion as DiscussionParam
from caliopen_main.message.parameters.participant import Participant

log = logging.getLogger(__name__)


def count_attachment(message):
    """Return number of attachment in message."""
    cpt = 0
    if message.attachments:
        for a in message.attachments:
            if a.name and not a.is_inline:
                cpt += 1
    return cpt


class DiscussionExternalLookup(BaseUserCore):
    """Lookup discussion by external id (facebook, gmail, ...)."""

    _model_class = ModelExternalLookup
    _pkey_name = 'external_id'


class DiscussionRecipientLookup(BaseUserCore):
    """Lookup discussion for a recipient, only one."""

    _model_class = ModelRecipientLookup
    _pkey_name = 'recipient_name'


class DiscussionMessageLookup(BaseUserCore):
    """Lookup discussion by external message_id."""

    _model_class = ModelMessageLookup
    _pkey_name = 'external_message_id'



def build_discussion(discussion, index_message):
    """Temporary build of output Discussion return parameter."""
    discuss = DiscussionParam()
    discuss.user_id = discussion.user_id
    discuss.discussion_id = index_message.discussion_id
    discuss.date_insert = discussion.date_insert
    discuss.date_update = index_message.date_insert
    discuss.excerpt = index_message.body[:100]
    # TODO
    # discussion.privacy_index = index_message.privacy_index
    # XXX Only last message recipient at this time

    for part in index_message.participants:
        participant = Participant()
        participant.address = part['address']
        participant.label = part['label']
        participant.type = part['type']
        if 'contact_id' in part:  # 'recipient' of type 'from' may not be Contact
            participant.contact_id = part['contact_id']
        participant.protocol = part['protocol']
        discuss.participants.append(participant)
    # XXX Missing values (at least other in parameter to fill)
    discuss.total_count = discussion.total_count
    discuss.unread_count = discussion.unread_count
    discuss.attachment_count = discussion.attachment_count
    return discuss.serialize()


class MainView(object):
    """Build main view return structure from index messages."""

    def build_responses(self, user, messages):
        """Build list of responses using core and related index message."""
        for message in messages:
            try:
                discussion = Discussion.get(user, message['discussion_id'])
            except NotFound:
                continue
            if discussion:
                yield build_discussion(discussion, message)

    def get(self, user, min_pi, max_pi, limit, offset):
        """Build the main view results."""
        # XXX use of correct pagination and correct datasource (index)
        dim = DIM(user.user_id)
        messages, total = dim.list_discussions(limit=limit, offset=offset,
                                               min_pi=min_pi, max_pi=max_pi)
        discussions = self.build_responses(user, messages)
        return {'discussions': list(discussions), 'total': total}


class Discussion(BaseUserCore):
    """Discussion core object."""

    _model_class = ModelDiscussion

    _pkey_name = 'discussion_id'

    @classmethod
    def create_from_message(cls, user, message):
        new_id = uuid.uuid4()
        kwargs = {'discussion_id': new_id,
                  'date_insert': datetime.utcnow(),
                  # 'privacy_index': message.privacy_index,
                  'importance_level': message.importance_level,
                  'excerpt': message.body[:200],
                  }
        discussion = cls.create(user, **kwargs)
        log.debug('Created discussion {}'.format(discussion.discussion_id))
        return discussion

    @classmethod
    def by_external_id(cls, user, external_discussion_id):
        try:
            lookup = DiscussionExternalLookup.get(user, external_discussion_id)
        except NotFound:
            return None
        return cls.get(user, lookup.discussion_id)

    @classmethod
    def by_recipient_name(cls, user, recipient_name):
        try:
            lookup = DiscussionRecipientLookup.get(user, recipient_name)
        except NotFound:
            return None
        return cls.get(user, lookup.discussion_id)

    @property
    def total_count(self):
        """Total messages counter."""
        return 0

    @property
    def unread_count(self):
        """Unread messages counter."""
        return 0

    @property
    def attachment_count(self):
        """Total number of attachments."""
        return 0


class ReturnDiscussion(ReturnCoreObject):
    _core_class = Discussion
    _return_class = DiscussionParam
