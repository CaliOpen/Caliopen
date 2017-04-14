# -*- coding: utf-8 -*-
"""Caliopen user message qualification logic."""
from __future__ import absolute_import, print_function, unicode_literals
import logging
import uuid
from caliopen_storage.exception import NotFound
from ..user.core import User

from caliopen_main.discussion.core.discussion import (Discussion,
                                                      DiscussionMessageLookup,
                                                      DiscussionRecipientLookup,
                                                      DiscussionExternalLookup)

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

    def _get_tags(self, user, mail):
        """Evaluate user rules to get all tags for a mail."""
        tags = []
        # TODO: implement with current tag model
        # for rule in user.rules:
        #     res, stop = rule.eval(mail)
        #     if res:
        #         tags.extend(res)
        #     if stop:
        #         break
        return tags

    def lookup(self, user, sequence):
        """Process lookup sequence to find discussion to associate."""
        log.debug('Lookup sequence %r' % sequence)
        for prop in sequence:
            try:
                kls = self._lookups[prop[0]]
                log.debug('Will lookup %s with value %s' %
                          (prop[0], prop[1]))
                return kls.get(user, prop[1])
            except NotFound:
                log.debug('Lookup type %s with value %s failed' %
                          (prop[0], prop[1]))
        return None

    def __init_lookups(self, user, sequence, message):
        for prop in sequence:
            kls = self._lookups[prop[0]]
            params = {
                kls._pkey_name: prop[1],
                'discussion_id': message.discussion_id
            }
            if 'message_id' in kls._model_class._columns.keys():
                params.update({'message_id': message.message_id})
            lookup = kls.create(user, **params)
            log.debug('Create lookup %r' % lookup)
            if prop[0] == 'list':
                return

    def process_inbound(self, message):
        """Process inbound message."""
        user = User.get(message.user_id)
        # TODO: make use of json raw message (already stored in db)
        raw_email = MailMessage(message.raw)

        # compute tags
        message.tags = self._get_tags(user, raw_email)
        log.debug('Resolved tags {}'.format(message.tags))

        # fill external references
        externals = message.external_references
        externals.message_id = raw_email.external_message_id
        externals.parent_id = raw_email.external_parent_id

        # lookup by external references
        lookup_sequence = raw_email.lookup_sequence()
        lkp = self.lookup(user, lookup_sequence)

        # Create or update existing discussion
        if lkp:
            log.debug('Found discussion %r' % lkp.discussion_id)
            discussion = Discussion.get(user, lkp.discussion_id)
            discussion.update_from_message(message)
        else:
            log.debug('Creating new discussion')
            discussion = Discussion.create_from_message(user, message)

        discussion_id = discussion.discussion_id if discussion else None
        message.discussion_id = uuid.UUID(discussion_id)
        # XXX missing discussion management

        # XXX Init lookup
        if not lkp:
            self.__init_lookups(user, lookup_sequence, message)
        else:
            if externals.message_id:
                params = {
                    'external_message_id': externals.message_id,
                    'discussion_id': discussion_id,
                    'message_id': message.message_id,
                }
                new_lookup = DiscussionMessageLookup.create(user, **params)
                log.debug('Created message lookup %r' % new_lookup)

        # update and index the message
        # message.model.lookup = lookup
        message.marshall_db()
        message.update_db()
        message.marshall_index()
        message.save_index()
        # message.update_index() # TODO: use update_index

        return message
