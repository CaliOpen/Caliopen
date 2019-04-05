# -*- coding: utf-8 -*-
"""Caliopen user message qualification logic."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
from caliopen_main.message.parameters import (NewInboundMessage,
                                              Attachment)

from caliopen_storage.config import Configuration
from caliopen_main.discussion.core import (DiscussionThreadLookup,
                                           DiscussionListLookup,
                                           DiscussionHashLookup,
                                           DiscussionParticipantLookup)

# XXX use a message formatter registry not directly mail format
from caliopen_main.message.parsers.mail import MailMessage
from caliopen_main.discussion.core import Discussion

from ..features import InboundMailFeature, marshal_features
from .base import BaseQualifier

log = logging.getLogger(__name__)


class UserMessageQualifier(BaseQualifier):
    """
    Process a message to enhance it with.

        - tags
        - pi
        - discussion reference
        - etc.

    """

    _lookups = {
        'hash': DiscussionHashLookup,
        'thread': DiscussionThreadLookup,
        'list': DiscussionListLookup,
        'participant': DiscussionParticipantLookup,
    }

    def lookup_discussion_sequence(self, mail, message, *args, **kwargs):
        """Return list of lookup type, value from a mail message."""
        seq = []

        # list lookup first
        for list_id in mail.extra_parameters.get('lists', []):
            seq.append(('list', list_id))

        participants = message.hash_participants
        seq.append(('hash', participants))

        # try to link message to external thread's root message-id
        if len(message.external_references["ancestors_ids"]) > 0:
            seq.append(("thread",
                        message.external_references["ancestors_ids"][0]))
        elif message.external_references["parent_id"]:
            seq.append(("thread", message.external_references["parent_id"]))
        elif message.external_references["message_id"]:
            seq.append(("thread", message.external_references["message_id"]))

        return seq

    def process_inbound(self, raw):
        """Process inbound message.

        @param raw: a RawMessage object
        @rtype: NewMessage
        """
        email = MailMessage(raw.raw_data)
        new_message = NewInboundMessage()
        new_message.raw_msg_id = raw.raw_msg_id
        new_message.subject = email.subject
        new_message.body_html = email.body_html
        new_message.body_plain = email.body_plain
        new_message.date = email.date
        new_message.size = email.size
        new_message.protocol = email.message_protocol
        new_message.is_unread = True
        new_message.is_draft = False
        new_message.is_answered = False
        new_message.is_received = True
        new_message.importance_level = 0  # XXX tofix on parser
        new_message.external_references = email.external_references

        participants = []
        for p in email.participants:
            participant, contact = self.get_participant(email, p)
            new_message.participants.append(participant)
            participants.append((participant, contact))

        if not participants:
            raise Exception("no participant found in raw email {}".format(
                raw.raw_msg_id))

        for a in email.attachments:
            attachment = Attachment()
            attachment.content_type = a.content_type
            attachment.file_name = a.filename
            attachment.size = a.size
            attachment.mime_boundary = a.mime_boundary
            if hasattr(a, "is_inline"):
                attachment.is_inline = a.is_inline
            new_message.attachments.append(attachment)

        # Compute PI !!
        conf = Configuration('global').configuration
        extractor = InboundMailFeature(email, conf)
        extractor.process(self.user, new_message, participants)

        # compute tags
        self._get_tags(new_message)
        if new_message.tags:
            log.debug('Resolved tags {}'.format(new_message.tags))

        # lookup by external references
        lookup_sequence = self.lookup_discussion_sequence(email, new_message)
        lkp = self.lookup(lookup_sequence)
        log.debug('Lookup with sequence {} give {}'.
                  format(lookup_sequence, lkp))

        if lkp:
            new_message.discussion_id = lkp.discussion_id
        else:
            discussion = Discussion.create_from_message(self.user, email,
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
        # TODO link raw message with current user
        # XXX create lookup
