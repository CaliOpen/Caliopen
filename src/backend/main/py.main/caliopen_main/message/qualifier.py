# -*- coding: utf-8 -*-
"""Caliopen user message qualification logic."""
from __future__ import absolute_import, print_function, unicode_literals
import logging
from .parameters import NewInboundMessage, Participant, Attachment

from caliopen_storage.exception import NotFound
from caliopen_storage.config import Configuration
from caliopen_main.user.core import Contact
from caliopen_main.discussion.core import (DiscussionMessageLookup,
                                           DiscussionRecipientLookup,
                                           DiscussionExternalLookup)
from caliopen_pi.features import InboundMailFeature
# XXX use a message formatter registry not directly mail format
from caliopen_main.parsers import MailMessage

log = logging.getLogger(__name__)


class UserMessageQualifier(object):
    """
    Process a message to enhance it with.

        - tags
        - pi
        - discussion reference
        - etc.

    """

    _lookups = {
        'parent': DiscussionMessageLookup,
        'list': DiscussionRecipientLookup,
        'recipient': DiscussionRecipientLookup,
        'external_thread': DiscussionExternalLookup,
        'from': DiscussionRecipientLookup,
    }

    def __init__(self, user):
        """Create a new instance of an user message qualifier."""
        self.user = user

    def _get_tags(self, message):
        """Evaluate user rules to get all tags for a mail."""
        return []

    def lookup(self, sequence):
        """Process lookup sequence to find discussion to associate."""
        log.debug('Lookup sequence %r' % sequence)
        for prop in sequence:
            try:
                kls = self._lookups[prop[0]]
                log.debug('Will lookup %s with value %s' %
                          (prop[0], prop[1]))
                return kls.get(self.user, prop[1])
            except NotFound:
                log.debug('Lookup type %s with value %s failed' %
                          (prop[0], prop[1]))
        return None

    def create_lookups(self, sequence, message):
        """Initialize lookup classes for the related sequence."""
        for prop in sequence:
            kls = self._lookups[prop[0]]
            params = {
                kls._pkey_name: prop[1],
                'discussion_id': message.discussion_id
            }
            if 'message_id' in kls._model_class._columns.keys():
                params.update({'message_id': message.message_id})
            lookup = kls.create(self.user, **params)
            log.debug('Create lookup %r' % lookup)
            if prop[0] == 'list':
                return

    def get_participant(self, message, participant):
        """Try to find a related contact and return a Participant instance."""
        p = Participant()
        p.address = participant.address
        p.type = participant.type
        p.label = participant.label
        p.protocol = message.message_type
        log.debug('Will lookup contact {} for user {}'.
                  format(participant.address, self.user.user_id))
        c = Contact.lookup(self.user, participant.address)
        if c:
            p.contact_ids = [c]
        return p, c

    def process_inbound(self, raw):
        """Process inbound message.

        @param raw: a RawMessage object
        @rtype: NewMessage
        """
        message = MailMessage(raw.raw_data)
        new_message = NewInboundMessage()
        new_message.raw_msg_id = raw.raw_msg_id
        new_message.subject = message.subject
        new_message.body_html = message.body_html
        new_message.body_plain = message.body_plain
        new_message.date = message.date
        new_message.size = message.size
        new_message.type = message.message_type
        new_message.is_unread = True
        new_message.is_draft = False
        new_message.is_answered = False
        new_message.importance_level = 0  # XXX tofix on parser
        new_message.external_references = message.external_references

        participants = []
        for p in message.participants:
            participant, contact = self.get_participant(message, p)
            new_message.participants.append(participant)
            participants.append((participant, contact))

        for a in message.attachments:
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
        extractor = InboundMailFeature(message, conf)
        privacy_features = extractor.process()
        new_message.pi = extractor.compute_pi(participants, privacy_features)

        # XXX hard type privacy_features for the moment
        for k, v in privacy_features.items():
            if v is not None:
                new_message.privacy_features[k] = str(v)

        # compute tags
        new_message.tags = self._get_tags(message)
        log.debug('Resolved tags {}'.format(new_message.tags))

        # lookup by external references
        lookup_sequence = message.lookup_discussion_sequence()
        lkp = self.lookup(lookup_sequence)
        log.debug('Lookup with sequence {} give {}'.
                  format(lookup_sequence, lkp))

        if lkp:
            new_message.discussion_id = lkp.discussion_id
        try:
            new_message.validate()
        except Exception as exc:
            log.error(
                "validation failed with error : « {} » \
                for new_message {}[dump : {}]".format(
                    exc, new_message, vars(new_message)))
        return new_message
        # TODO link raw message with current user
        # XXX create lookup
