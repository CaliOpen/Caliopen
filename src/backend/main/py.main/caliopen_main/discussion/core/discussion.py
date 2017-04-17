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
from ..store.discussion_index import DiscussionIndexManager as DIM

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


def build_discussion(core, index):
    """Temporary build of output Discussion return parameter."""
    discuss = DiscussionParam()
    discuss.user_id = core.user_id
    discuss.discussion_id = core.discussion_id
    discuss.date_insert = core.date_insert
    discuss.date_update = index.last_message.date_insert
    discuss.excerpt = index.last_message.body[:100]
    discuss.total_count = index.total_count

    # TODO
    # discussion.privacy_index = index_message.privacy_index
    # XXX Only last message recipient at this time

    for part in index.last_message.participants:
        participant = Participant()
        participant.address = part['address']
        participant.label = part['label']
        participant.type = part['type']
        if 'contact_id' in part:
            participant.contact_id = part['contact_id']
        participant.protocol = part['protocol']
        discuss.participants.append(participant)

    # XXX Missing values (at least other in parameter to fill)
    discuss.unread_count = index.unread_count
    discuss.attachment_count = index.attachment_count
    return discuss.serialize()


class MainView(object):
    """Build main view return structure from index messages."""

    def build_responses(self, user, discussions):
        """Build list of responses using core and related index message."""
        for discussion in discussions:
            try:
                core = Discussion.get(user, discussion.discussion_id)
            except NotFound:
                continue
            if core:
                yield build_discussion(core, discussion)

    def get(self, user, min_pi, max_pi, limit, offset):
        """Build the main view results."""
        # XXX use of correct pagination and correct datasource (index)
        dim = DIM(user.user_id)
        discussions, total = dim.list_discussions(limit=limit, offset=offset,
                                                  min_pi=min_pi, max_pi=max_pi)
        responses = self.build_responses(user, discussions)
        return {'discussions': list(responses), 'total': total}


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


class ReturnDiscussion(ReturnCoreObject):
    _core_class = Discussion
    _return_class = DiscussionParam
