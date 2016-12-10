# -*- coding: utf-8 -*-
"""
Caliopen mail message format management.

mail parsing is included in python, so this is not
getting external dependencies.

For formats with needs of external packages, they
must be defined outside of this one.
"""

import logging
import base64
import random
from itertools import groupby
from mailbox import Message
from datetime import datetime
from email.utils import parsedate_tz, mktime_tz

from ..parameters import NewMessage, Part
from caliopen_main.user.helpers.normalize import clean_email_address


log = logging.getLogger(__name__)


class MailPart(object):

    """Mail part structure."""

    def __init__(self, part):
        """Initialize part structure."""
        self.content_type = part.get_content_type()
        self.filename = part.get_filename()
        text = part.get_payload()
        self.size = len(text)
        self.can_index = False
        if 'text' in part.get_content_type():
            self.can_index = True
            charsets = part.get_charsets()
            if len(charsets) > 1:
                raise Exception('Too many charset %r for %s' %
                                (charsets, part.get_payload()))
            self.charset = charsets[0]
            if 'Content-Transfer-Encoding' in part.keys():
                if part.get('Content-Transfer-Encoding') == 'base64':
                    text = base64.b64decode(text)
            if self.charset:
                text = text.decode(self.charset, 'replace'). \
                    encode('utf-8')
        self.data = text


class MailMessage(object):

    """
    Mail message structure.

    Got a mail in raw rfc2822 format, parse it to
    resolve all recipients emails, parts and group headers
    """

    recipient_headers = ['From', 'To', 'Cc', 'Bcc']
    message_type = 'mail'

    def __init__(self, raw):
        """Initialize structure from a raw mail."""
        try:
            self.mail = Message(raw)
        except Exception as exc:
            log.error('Parse message failed %s' % exc)
            raise
        if self.mail.defects:
            # XXX what to do ?
            log.warn('Defects on parsed mail %r' % self.mail.defects)
        self.recipients = self._extract_recipients()
        self.parts = self._extract_parts()
        self.headers = self._extract_headers()
        self.subject = self.mail.get('Subject')
        mail_date = self.mail.get('Date')
        if mail_date:
            tmp_date = parsedate_tz(mail_date)
            self.date = datetime.fromtimestamp(mktime_tz(tmp_date))
        else:
            log.debug('No date on mail using now (UTC)')
            self.date = datetime.utcnow()
        self.external_message_id = self.mail.get('Message-Id')
        self.external_parent_id = self.mail.get('In-Reply-To')
        self.size = len(raw)
        log.debug('Parsed mail {} with size {}'.
                  format(self.external_message_id, self.size))

    @property
    def text(self):
        """Message all text."""
        # XXX : more complexity ?
        return "\n".join([x.data for x in self.parts if x.can_index])

    def _extract_recipients(self):
        recip = {}
        for header in self.recipient_headers:
            addrs = []
            recipient_type = header.lower()
            if self.mail.get(header):
                if ',' in self.mail.get(header):
                    addrs.extend(self.mail.get(header).split(','))
                else:
                    addrs.append(self.mail.get(header))
            addrs = [clean_email_address(x) for x in addrs]
            recip[recipient_type] = addrs
        return recip

    def _extract_headers(self):
        """
        Extract all headers into list.

        Duplicate on headers exists, group them by name
        with a related list of values
        """
        def keyfunc(item):
            return item[0]

        # Group multiple value for same headers into a dict of list
        headers = {}
        data = sorted(self.mail.items(), key=keyfunc)
        for k, g in groupby(data, key=keyfunc):
            headers[k] = [x[1] for x in g]
        return headers

    def _extract_parts(self):
        """Multipart message, extract parts."""
        parts = []
        for p in self.mail.walk():
            if not p.is_multipart():
                parts.append(self._process_part(p))
        return parts

    def _process_part(self, part):
        return MailPart(part)

    @property
    def transport_privacy_index(self):
        """Evaluate transport privacy index."""
        # XXX : TODO
        return random.randint(0, 50)

    @property
    def content_privacy_index(self):
        """Evaluate content privacy index."""
        # XXX: real evaluation needed ;)
        if 'PGP' in [x.content_type for x in self.parts]:
            return random.randint(50, 100)
        else:
            return 0.0

    @property
    def spam_level(self):
        """Report spam level."""
        try:
            score = self.headers.get('X-Spam-Score')
            score = float(score[0])
        except:
            score = 0.0
        if score < 5.0:
            return 0.0
        if score >= 5.0 and score < 15.0:
            return min(score * 10, 100.0)
        return 100.0

    @property
    def importance_level(self):
        """Return percent estimated importance level of this message."""
        # XXX. real compute needed
        return 0 if self.spam_level else random.randint(50, 100)

    @property
    def lists(self):
        """List related to message."""
        lists = []
        for list_name in self.headers.get('List-ID', []):
            lists.append(list_name)
        return lists

    @property
    def from_(self):
        """Get from recipient."""
        from_ = self.recipients.get('from')
        if from_:
            # XXX should do better
            return from_[0][1]
        return None

    def lookup_sequence(self):
        """Build parameter sequence for lookups."""
        seq = []
        # first from parent
        if self.external_parent_id:
            seq.append(('parent', self.external_parent_id))
        # then list lookup
        for listname in self.lists:
            seq.append(('list', listname))
        # last try to lookup from sender address
        if self.from_:
            seq.append(('from', self.from_))
        return seq

    def to_parameter(self):
        """Transform mail to a NewMessage parameter."""
        msg = NewMessage()
        msg.type = 'email'
        msg.state = 'unread'
        msg.subject = self.subject
        msg.from_ = self.from_
        # XXX need transform to part parameter
        for part in self.parts:
            param = Part()
            param.content_type = part.content_type
            param.data = part.data
            param.size = part.size
            param.filename = part.filename
            param.can_index = part.can_index
            msg.parts.append(param)
        msg.headers = self.headers
        msg.date = self.date
        msg.size = self.size
        msg.text = self.text
        msg.external_parent_id = self.external_parent_id
        msg.external_message_id = self.external_message_id
        # XXX well ....
        msg.privacy_index = int(self.transport_privacy_index +
                                self.content_privacy_index) / 2
        msg.importance_level = self.importance_level
        return msg
