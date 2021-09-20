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
import string
from itertools import groupby
from mailbox import Message
from email.header import decode_header
import datetime
import pytz

from email.utils import parsedate_tz, mktime_tz, getaddresses

import zope.interface

from caliopen_main.common.helpers.normalize import clean_email_address
from caliopen_main.common.helpers.strings import to_utf8
from caliopen_main.common.interfaces import (IAttachmentParser, IMessageParser,
                                             IParticipantParser)
# from caliopen_main.common.objects.tag import ResourceTag as Tag
from caliopen_main.user.parameters.tag import ImportedTag as Tag

log = logging.getLogger(__name__)

TEXT_CONTENT_TYPE = ['text', 'xml', 'vnd', 'xhtml', 'json', 'msword']
EXCLUDED_EXT_FLAGS = ['\Seen', 'nonjunk', '$notjunk', 'notjunk', '$mdnsent',
                      '$forwarded', '$sent', '\Recent', '\All', '\Archive',
                      '\Drafts', '\Junk', '\Sent', '\Trash']


@zope.interface.implementer(IAttachmentParser)
class MailAttachment(object):
    """Mail part structure."""

    def __init__(self, part):
        """Extract attachment attributes from a mail part."""
        self.content_type = part.get_content_type()
        self.filename = part.get_filename()
        if self.filename:
            try:
                self.filename = self.filename.decode('utf-8')
            except UnicodeError:
                log.warn('Invalid filename encoding')
        content_disposition = part.get("Content-Disposition")
        if content_disposition:
            dispositions = content_disposition.strip().split(";")
            self.is_inline = bool(dispositions[0].lower() == "inline")
        else:
            self.is_inline = True
        data = part.get_payload()
        self.can_index = False
        if any(x in part.get_content_type() for x in TEXT_CONTENT_TYPE):
            self.can_index = True
            charsets = part.get_charsets()
            if len(charsets) > 1:
                raise Exception('Too many charset %r for %s' %
                                (charsets, part.get_payload()))
            self.charset = charsets[0]
            if 'Content-Transfer-Encoding' in part.keys():
                if part.get('Content-Transfer-Encoding') == 'base64':
                    data = base64.b64decode(data)
            if self.charset:
                data = data.decode(self.charset, 'replace'). \
                    encode('utf-8')
        boundary = part.get("Mime-Boundary", failobj="")
        if boundary is not "":
            self.mime_boundary = boundary
        else:
            self.mime_boundary = ""
        self.data = data
        self.size = len(data) if data else 0

    @classmethod
    def is_attachment(cls, part):
        """Check if a part conform to Caliopen's attachment definition.

        A part is an "attachment" if it verifies ANY of this conditions :
        - it has a Content-Disposition header with param "attachment"
        - the main part of the Content-Type header
                                        is within "attachment_types" list below
        - the part is not a PGP/Mime encryption envelope

        see https://www.iana.org/assignments/media-types/media-types.xhtml

        :param part: an email/message's part as return by the walk() func.
        :return: true or false
        """
        content_disposition = part.get("Content-Disposition")
        if content_disposition:
            dispositions = content_disposition.strip().split(";")
            if bool(dispositions[0].lower() == "attachment") or \
                    bool(dispositions[0].lower() == "inline"):
                return True

        attachment_types = (
            "application", "image", "video", "audio", "message", "font")
        if part.get_content_maintype() in attachment_types:
            return True
        return False


@zope.interface.implementer(IParticipantParser)
class MailParticipant(object):
    """Mail participant parser."""

    def __init__(self, type, addr):
        """Parse an email address and create a participant."""
        self.type = type
        parts = clean_email_address(addr)
        self.address = parts[0]
        self.label = parts[1]


@zope.interface.implementer(IMessageParser)
class MailMessage(object):
    """
    Mail message structure.

    Got a mail in raw rfc2822 format, parse it to
    resolve all recipients emails, parts and group headers
    """

    recipient_headers = ['From', 'To', 'Cc', 'Bcc']
    message_protocol = 'email'
    warnings = []
    body_html = ""
    body_plain = ""

    def __init__(self, raw_data):
        """Parse an RFC2822,5322 mail message."""
        self.raw = raw_data
        self._extra_parameters = {}
        try:
            self.mail = Message(raw_data)
        except Exception as exc:
            log.error('Parse message failed %s' % exc)
            raise exc
        if self.mail.defects:
            # XXX what to do ?
            log.warn('Defects on parsed mail %r' % self.mail.defects)
            self.warning = self.mail.defects
        self.get_bodies()

    def get_bodies(self):
        """Extract body alternatives, if any."""
        body_html = ""
        body_plain = ""

        if self.mail.get("Content-Type", None):
            if self.mail.is_multipart():
                if self.mail.get_content_subtype() == 'encrypted':
                    parts = self.mail.get_payload()
                    if len(parts) == 2:
                        self.body_plain = parts[1].get_payload()
                        return
                    else:
                        log.warn('Encrypted message with invalid parts count')
                for top_level_part in self.mail.get_payload():
                    if top_level_part.get_content_maintype() == "multipart":
                        for alternative in top_level_part.get_payload():
                            charset = alternative.get_param("charset")
                            if isinstance(charset, tuple):
                                charset = unicode(charset[2],
                                                  charset[0] or "us-ascii")
                            if alternative.get_content_type() == "text/plain":
                                body_plain = alternative.get_payload(
                                    decode=True)
                                self.body_plain = to_utf8(body_plain, charset)
                            elif alternative.get_content_type() == "text/html":
                                body_html = alternative. \
                                    get_payload(decode=True)
                                self.body_html = to_utf8(body_html, charset)
                        break
                    else:
                        charset = top_level_part.get_param("charset")
                        if isinstance(charset, tuple):
                            charset = unicode(charset[2],
                                              charset[0] or "us-ascii")
                        if top_level_part.get_content_type() == "text/plain":
                            body_plain = top_level_part. \
                                get_payload(decode=True)
                            self.body_plain = to_utf8(body_plain, charset)
                        elif top_level_part.get_content_type() == "text/html":
                            body_html = top_level_part.get_payload(decode=True)
                            self.body_html = to_utf8(body_html, charset)
            else:
                charset = self.mail.get_param("charset")
                if isinstance(charset, tuple):
                    charset = unicode(charset[2], charset[0] or "us-ascii")
                if self.mail.get_content_type() == "text/html":
                    body_html = self.mail.get_payload(decode=True)
                    self.body_html = to_utf8(body_html, charset)
                else:
                    body_plain = self.mail.get_payload(decode=True)
                    self.body_plain = to_utf8(body_plain, charset)
        else:
            self.body_plain = self.mail.get_payload(decode=True)

    @property
    def subject(self):
        """Mail subject."""
        s = decode_header(self.mail.get('Subject'))
        charset = s[0][1]
        if charset is not None:
            return s[0][0].decode(charset, "replace"). \
                encode("utf-8", "replace")
        else:
            return s[0][0]

    @property
    def size(self):
        """Get mail size in bytes."""
        return len(self.mail.as_string())

    @property
    def external_references(self):
        """Return mail references to be used as external references.

         making use of RFC5322 headers :
            message-id
            in-reply-to
            references
        headers' strings are pruned to extract email addresses only.
        """
        ext_id = self.mail.get('Message-Id')
        parent_id = self.mail.get('In-Reply-To')
        ref = self.mail.get_all("References")
        ref_addr = getaddresses(ref) if ref else None
        ref_ids = [address[1] for address in ref_addr] if ref_addr else []
        mid = clean_email_address(ext_id)[1] if ext_id else None
        if not mid:
            log.error('Unable to find correct message_id {}'.format(ext_id))
            mid = ext_id
        pid = clean_email_address(parent_id)[1] if parent_id else None
        if not pid:
            pid = parent_id
        return {
            'message_id': mid,
            'parent_id': pid,
            'ancestors_ids': ref_ids}

    @property
    def date(self):
        """Get UTC date from a mail message."""
        mail_date = self.mail.get('Date')
        if mail_date:
            try:
                tmp_date = parsedate_tz(mail_date)
                return datetime.datetime.fromtimestamp(mktime_tz(tmp_date))
            except TypeError:
                log.error('Invalid date in mail {}'.format(mail_date))
        log.debug('No date on mail using now (UTC)')
        return datetime.datetime.now(tz=pytz.utc)

    @property
    def participants(self):
        """Mail participants."""
        participants = []
        for header in self.recipient_headers:
            addrs = []
            participant_type = header.capitalize()
            if self.mail.get(header):
                parts = self.mail.get(header).split('>,')
                if not parts:
                    pass
                if parts and parts[0] == 'undisclosed-recipients:;':
                    pass
                filtered = [x for x in parts if '@' in x]
                addrs.extend(filtered)
            for addr in addrs:
                participant = MailParticipant(participant_type, addr.lower())
                if participant.address == '' and participant.label == '':
                    log.warn('Invalid email address {}'.format(addr))
                else:
                    participants.append(participant)
        return participants

    @property
    def attachments(self):
        """Extract parts which we consider as attachments."""
        if not self.mail.is_multipart():
            return []
        attchs = []
        for p in walk_with_boundary(self.mail, ""):
            if not p.is_multipart():
                if p.get_content_subtype() == 'pgp-encrypted':
                    # Special consideration. Do not present it as an attachment
                    # but set _extra_parameters accordingly
                    self._extra_parameters.update({'encrypted': 'pgp'})
                    continue
                if MailAttachment.is_attachment(p):
                    attchs.append(MailAttachment(p))
        return attchs

    @property
    def extra_parameters(self):
        """Mail message extra parameters."""
        lists = self.mail.get_all("List-ID")
        lists_addr = getaddresses(lists) if lists else None
        lists_ids = [address[1] for address in lists_addr] \
            if lists_addr else []
        self._extra_parameters.update({'lists': lists_ids})
        return self._extra_parameters

    # Others parameters specific for mail message

    @property
    def headers(self):
        """Extract all headers into list.

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

    @property
    def external_flags(self):
        """
        Get headers added by our fetcher that represent flags or labels
        set by external provider,
        returned as list of tags
        """
        tags = []
        for h in ['X-Fetched-Imap-Flags', 'X-Fetched-X-GM-LABELS']:
            enc_flags = self.mail.get(h)
            if enc_flags:
                flags_str = base64.decodestring(enc_flags)
                for flag in string.split(flags_str, '\r\n'):
                    if flag not in EXCLUDED_EXT_FLAGS:
                        tag = Tag()
                        tag.name = flag
                        tag.label = flag
                        tag.type = 'imported'
                        tags.append(tag)
        return tags


def walk_with_boundary(message, boundary):
    """Recurse in boundaries."""
    message.add_header("Mime-Boundary", boundary)
    yield message
    if message.is_multipart():
        subboundary = message.get_boundary("")
        for subpart in message.get_payload():
            for subsubpart in walk_with_boundary(subpart, subboundary):
                yield subsubpart
