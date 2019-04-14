# -*- coding: utf-8 -*-
"""Caliopen message base qualifier."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from caliopen_storage.exception import NotFound
from caliopen_main.contact.core import Contact
from caliopen_main.participant.parameters import Participant


log = logging.getLogger(__name__)


class BaseQualifier(object):
    _lookups = {}

    def __init__(self, user, identity):
        """Create a new instance of an user message qualifier."""
        self.user = user
        self.identity = identity

    def _get_tags(self, message):
        """Get tags for a message."""
        tags = []
        if message.privacy_features.get('is_internal', False):
            # XXX do not hardcode the wanted tag
            internal_tag = [x for x in self.user.tags if x.name == 'internal']
            if internal_tag:
                tags.append(internal_tag[0].name)
        message.tags = tags

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
            lookup = kls.create(self.user, **params)
            log.info('Create lookup %r' % lookup)

    def get_participant(self, message, participant):
        """Try to find a related contact and return a Participant instance."""
        p = Participant()
        p.address = participant.address
        p.type = participant.type
        p.label = participant.label
        p.protocol = message.message_protocol
        log.debug('Will lookup contact {} for user {}'.
                  format(participant.address, self.user.user_id))
        c = Contact.lookup(self.user, participant.address)
        if c:
            p.contact_ids = [c.contact_id]
        else:
            if p.address == self.identity.identifier:
                p.contact_ids = [self.user.contact_id]
        return p, c
