# -*- coding: utf-8 -*-
"""Caliopen user message qualification logic."""
from __future__ import absolute_import, print_function, unicode_literals
import logging

from caliopen_main.message.parameters import NewInboundMessage
from caliopen_main.message.parsers.twitter import TwitterDM
from caliopen_main.discussion.core import Discussion
from caliopen_main.discussion.core import (DiscussionThreadLookup,
                                           DiscussionListLookup,
                                           DiscussionHashLookup,
                                           DiscussionParticipantLookup)

from ..features import marshal_features
from .base import BaseQualifier

log = logging.getLogger(__name__)


class UserDMQualifier(BaseQualifier):
    """Process a Twitter direct message to unmarshal it in our stack."""

    _lookups = {
        'global': DiscussionHashLookup,
        'thread': DiscussionThreadLookup,
        'list': DiscussionListLookup,
        'participant': DiscussionParticipantLookup
    }

    def lookup_discussion_sequence(self, message, *args, **kwargs):
        """Return list of lookup type, value from a tweet."""
        seq = list()

        seq.append(('global', message.hash_participants))

        if message.external_references["message_id"]:
            seq.append(("thread", message.external_references["message_id"]))

        return seq

    def process_inbound(self, raw):
        """
        Process inbound message.

        @param raw: a RawMessage object
            which should be a json conforming to
            https://developer.twitter.com/en/docs/direct-messages/\
            sending-and-receiving/guides/message-create-object
        @rtype: NewMessage
        """
        tweet = TwitterDM(raw.raw_data)
        new_message = NewInboundMessage()
        new_message.raw_msg_id = raw.raw_msg_id
        new_message.body_plain = tweet.body_plain
        new_message.date = tweet.date
        new_message.protocol = tweet.protocol
        new_message.is_unread = True
        new_message.is_draft = False
        new_message.is_answered = False
        new_message.is_received = True
        new_message.importance_level = 0  # XXX tofix on parser
        new_message.external_references = tweet.external_references

        participants = []
        for p in tweet.participants:
            participant, contact = self.get_participant(tweet, p)
            new_message.participants.append(participant)
            participants.append(participant)
        if not participants:
            raise Exception("no participant found in raw tweet {}".format(
                raw.raw_msg_id))

        # Compute PI !!
        # TODO

        # compute tags
        self._get_tags(new_message)
        if new_message.tags:
            log.debug('Resolved tags {}'.format(new_message.tags))

        # lookup by external references
        lookup_sequence = self.lookup_discussion_sequence(new_message)
        lkp = self.lookup(lookup_sequence)
        log.debug('Lookup with sequence {} give {}'.
                  format(lookup_sequence, lkp))

        if lkp:
            new_message.discussion_id = lkp.discussion_id
        else:
            discussion = Discussion.create_from_message(self.user, tweet,
                                                        new_message.participants)
            log.debug('Created discussion {}'.format(discussion.discussion_id))
            new_message.discussion_id = discussion.discussion_id
            self.create_lookups(lookup_sequence, new_message)
        # Format features
        new_message.privacy_features = \
            marshal_features(new_message.privacy_features)
        try:
            new_message.validate()
        except Exception as exc:
            log.error(
                "validation failed with error : « {} » \
                for new_message {}[dump : {}]".format(
                    exc, new_message, vars(new_message)))
            raise exc

        return new_message
