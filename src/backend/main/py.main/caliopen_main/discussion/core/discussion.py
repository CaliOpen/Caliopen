# -*- coding: utf-8 -*-
"""Caliopen core discussion related classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import hashlib

from caliopen_storage.exception import NotFound

from caliopen_main.common.core import BaseUserCore
from caliopen_main.common.helpers.strings import unicode_truncate

from ..store.discussion_lookup import (DiscussionListLookup as ModelListLookup,
                                       DiscussionThreadLookup as ModelThreadLookup)
from caliopen_main.discussion.objects import Discussion as DiscussionObject
from caliopen_main.participant.core import ParticipantLookup
from caliopen_main.participant.core import HashLookup
from ..store.discussion_index import DiscussionIndexManager as DIM

from caliopen_main.discussion.parameters import Discussion as DiscussionParam
from caliopen_main.participant.parameters import Participant

log = logging.getLogger(__name__)


def count_attachment(message):
    """Return number of attachment in message."""
    cpt = 0
    if message.attachments:
        for a in message.attachments:
            if a.name and not a.is_inline:
                cpt += 1
    return cpt


class DiscussionListLookup(BaseUserCore):
    """Lookup discussion by external list-id"""

    _model_class = ModelListLookup
    _pkey_name = 'list_id'


class DiscussionThreadLookup(BaseUserCore):
    """Lookup discussion by external thread's root message_id."""

    _model_class = ModelThreadLookup
    _pkey_name = 'external_root_msg_id'


class DiscussionHashLookup(BaseUserCore):
    """Lookup discussion by participants' hash"""

    _model_class = ParticipantLookup  #  TODO : changed
    _pkey_name = 'source'


class DiscussionParticipantLookup(BaseUserCore):
    """Lookup discussion by a participant_id"""

    _model_class = ParticipantLookup  # TODO : changed
    _pkey_name = "source"


def build_discussion(core, index):
    """Temporary build of output Discussion return parameter."""
    discuss = DiscussionParam()
    discuss.user_id = core.user_id
    discuss.discussion_id = core.discussion_id
    discuss.date_insert = core.date_insert
    discuss.date_update = index.last_message.date_sort
    # TODO : excerpt from plain or html body
    maxsize = 100
    discuss.last_message_id = index.last_message.message_id
    discuss.last_message_subject = index.last_message.subject
    discuss.excerpt = unicode_truncate(index.last_message.body_plain,
                                       maxsize) if index.last_message.body_plain else u''
    discuss.total_count = index.total_count
    discuss.subject = index.last_message.subject
    discuss.protocol = index.last_message.protocol

    # TODO
    # discussion.privacy_index = index_message.privacy_index
    # XXX Only last message recipient at this time

    for part in index.last_message.participants:
        participant = Participant()
        participant.address = part['address']
        try:
            participant.label = part['label']
        except:
            participant.label = part['address']
        participant.type = part['type']
        if 'contact_ids' in part:
            participant.contact_ids = part['contact_ids']
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

    def get(self, user, min_il, max_il, limit, offset):
        """Build the main view results."""
        # XXX use of correct pagination and correct datasource (index)
        dim = DIM(user)
        discussions, total = dim.list_discussions(limit=limit, offset=offset,
                                                  min_il=min_il, max_il=max_il)
        responses = self.build_responses(user, discussions)
        return {'discussions': list(responses), 'total': total}

    def get_one(self, user, discussion_id, min_il=0, max_il=100):

        discussion_index = DIM(user).get_by_id(discussion_id, min_il, max_il)
        if not discussion_index:
            raise NotFound
        discussion_core = Discussion.get(user, discussion_index.discussion_id)
        if discussion_core:
            return build_discussion(discussion_core, discussion_index)
        else:
            raise NotFound


class Discussion(BaseUserCore):
    """Discussion core object."""

    _model_class = ModelDiscussion
    _pkey_name = 'discussion_id'

    @classmethod
    def create_from_message(cls, user, message, participants):
        """
        create a new Discussion in store alongside relevant lookup tables
        :param user:
        :param message: an object with body_plain property
        :param participants: a collection of Participant with participant_id
        :return: Discussion
        """
        # TODO excerpt from plain or html body
        maxsize = 200
        excerpt = unicode_truncate(message.body_plain,
                                   maxsize) if message.body_plain else u''
        new_id = uuid.uuid4()
        ids_hash = hash_participants_ids(participants)
        kwargs = {u'discussion_id': new_id,
                  u'date_insert': datetime.datetime.now(tz=pytz.utc),
                  # 'privacy_index': message.privacy_index,
                  # 'importance_level': message.importance_level,
                  u'participants_hash': ids_hash['hash'],
                  u'participants_ids': ids_hash['ids'],
                  u'excerpt': excerpt,
                  }

        discussion = cls.create(user, **kwargs)

        # fill-in lookup tables
        for participant_id in ids_hash['ids']:
            DiscussionParticipantLookup.create(user,
                                               participant_id=participant_id,
                                               discussion_id=\
                                                   discussion.discussion_id)

        DiscussionHashLookup.create(user, hashed=ids_hash['hash'],
                                    discussion_id=discussion.discussion_id)

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

    @classmethod
    def by_hash(cls, user, hash):
        try:
            lookup = DiscussionHashLookup.get(user, hash)
        except NotFound:
            return None
        return cls.get(user, lookup.discussion_id)

    @classmethod
    def by_participant_id(cls, user, participant_id):
        try:
            lookup = DiscussionParticipantLookup.get(user, participant_id)
        except NotFound:
            return None
        return cls.get(user,
                       lookup.discussion_id)  # TODO : not a get but lookup
