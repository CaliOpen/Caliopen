# -*- coding: utf-8 -*-

import logging
import json
import dateutil.parser

from zope.interface import implementer

from caliopen_main.common.interfaces import (IMessageParser, IParticipantParser)
from caliopen_main.common.helpers.normalize import parse_mastodon_url

log = logging.getLogger(__name__)


@implementer(IMessageParser)
class MastodonStatus(object):
    """
    Mastodon status structure
    """

    message_protocol = 'mastodon'
    warnings = []
    body_html = ""
    body_plain = ""

    def __init__(self, raw_data):
        self.raw = raw_data
        self.dm = json.loads(self.raw)
        self.recipients = []
        for m in self.dm["mentions"]:
            self.recipients.append(MastodonParticipant("To", m['url']))

        self.sender = MastodonParticipant('From', self.dm['account']['url'])
        self.protocol = self.message_protocol
        self.is_unread = True  # TODO: handle DM sent by user
        #                                     if broker keeps them when fetching
        self.is_draft = False
        self.is_answered = False
        self.is_received = True  # TODO: handle DM sent by user
        #                                     if broker keeps them when fetching
        self.importance_level = 0
        self.get_bodies()

    def get_bodies(self):
        if self.dm['spoiler_text'] != '':
            self.body_html = "<span class='spoiler_text'>" + self.dm[
                'spoiler_text'] + "</span>"
        self.body_html += self.dm['content']

    @property
    def subject(self):
        """
        toots don't have subject
        should we return an excerpt ?
        """
        return ''

    @property
    def size(self):
        """Get json toot object size in bytes."""
        return len(self.dm.as_string())

    @property
    def date(self):
        return dateutil.parser.isoparse(self.dm['created_at'].rstrip('UTC'))

    @property
    def participants(self):
        "one sender only for now"
        p = [self.sender]
        p.extend(self.recipients)
        return p

    @property
    def external_references(self):
        return {'message_id': self.dm["id"],
                'parent_id': self.dm["in_reply_to_id"]}

    @property
    def attachments(self):
        """TODO"""
        return []

    @property
    def extra_parameters(self):
        """TODO"""
        return {}


@implementer((IParticipantParser))
class MastodonParticipant(object):
    """
    Mastodon sender and recipient parser
    """

    def __init__(self, type, url):
        """Parse a mastodon address and create a participant."""
        domain, username = parse_mastodon_url(url)
        self.address = username + '@' + domain
        self.label = username
        self.type = type
