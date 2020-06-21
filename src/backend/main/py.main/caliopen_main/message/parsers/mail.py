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

PGP_MESSAGE_HEADER = '-----BEGIN PGP MESSAGE-----'


def is_inline_part(part):
    """Return true if part is inline, false otherwise."""
    sub_type = part.get_content_subtype()
    if sub_type in ['html', 'text', 'plain']:
        return True
    content_disposition = part.get("Content-Disposition")
    if content_disposition:
        if ';' in content_disposition:
            if content_disposition.lower().startswith('attachment'):
                return False
    # XXX : missing strange situation with multipart related and inline
    """
    &&
        // If multipart/related, only the first part can be inline
        // If a text part with a filename, and not the first item
        // in the multipart, assume it is an attachment
        ( i === 0 ||
          ( multipartType != "related" &&
            ( isInlineMediaType( part.type ) || !part.name ) ) );
    """
    return is_inline_media(part)


def is_inline_media(part):
    """Return true if the media can be seen inline, false otherwise."""
    maintype = part.get_content_maintype()
    if maintype in ['image', 'audio', 'video']:
        return True
    return False


class MailAttachment(object):
    """Mail part structure."""

    zope.interface.implements(IAttachmentParser)

    def __init__(self, part):
        """Extract attachment attributes from a mail part."""
        self.content_type = part.get_content_type()
        self.filename = part.get_filename()
        if self.filename:
            try:
                self.filename = self.filename.decode('utf-8')
            except UnicodeError:
                log.warn('Invalid filename encoding')
        self.is_inline = is_inline_part(part)
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
                # https://tools.ietf.org/html/rfc2045#section-6.1
                encoding = part['Content-Transfer-Encoding']
                data = self._decode_data(data, encoding)
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

    def _decode_data(self, data, encoding):
        if encoding.lower() == 'base64':
            return base64.b64decode(data)
        log.warn('Unhandled encoding {}'.format(encoding))
        return data


class MailParticipant(object):
    """Mail participant parser."""

    zope.interface.implements(IParticipantParser)

    def __init__(self, type, addr):
        """Parse an email address and create a participant."""
        self.type = type
        parts = clean_email_address(addr)
        self.address = parts[0]
        self.label = parts[1]


class MailMessage(object):
    """
    Mail message structure.

    Got a mail in raw rfc2822 format, parse it to
    resolve all recipients emails, parts and group headers
    """

    zope.interface.implements(IMessageParser)

    recipient_headers = ['From', 'To', 'Cc', 'Bcc']
    message_protocol = 'email'

    def __init__(self, raw_data):
        """Parse an RFC2822,5322 mail message."""
        self.raw = raw_data
        self._extra_parameters = {}
        self.body_plain = ''
        self.body_html = ''
        self._attachments = []
        try:
            self.mail = Message(raw_data)
        except Exception as exc:
            log.error('Parse message failed %s' % exc)
            raise exc
        if self.mail.defects:
            # XXX what to do ?
            log.warn('Defects on parsed mail %r' % self.mail.defects)
            self.warnings = self.mail.defects
        else:
            self.warnings = []
        self._parse()
        self._detect_pgp_inline()

    def _detect_pgp_inline(self):
        """PGP Inline is not an RFC, we have to detect header in body_plain."""
        if 'pgp' in self._extra_parameters.get('encrypted', ''):
            # Not inline, detected on mime structure
            return
        try:
            body = self.body_plain.decode('utf-8')
            if body.startswith(PGP_MESSAGE_HEADER):
                self._extra_parameters.update({'encrypted': 'pgp-inline'})
        except UnicodeDecodeError:
            log.warn('Invalid body_plain encoding for message')
            pass

    def _encode_part(self, part):
        """Encode a part to utf-8."""
        charsets = part.get_charsets()
        charset = charsets[0] if charsets else None
        return to_utf8(part.get_payload(), charset)

    def _parse(self):
        """Main function to build mail representation."""
        attachments = []
        html_bodies = []
        text_bodies = []
        main_type = self.mail.get_content_maintype()
        sub_type = self.mail.get_content_subtype()
        multipart_type = sub_type if main_type == 'multipart' else None
        in_alternative = True if sub_type == 'alternative' else False

        parts = self.mail.get_payload()
        if not isinstance(parts, list):
            # plain mail
            content = self._encode_part(self.mail)
            if sub_type == 'html':
                self.body_html = content
            elif sub_type == 'plain':
                self.body_plain = content
            else:
                attachments.append(self.mail)
        else:
            self._parse_structure(parts, multipart_type, in_alternative,
                                  attachments, html_bodies, text_bodies)
            self.body_html = '\n'.join([self._encode_part(x)
                                        for x in html_bodies])
            self.body_plain = '\n'.join([self._encode_part(x)
                                         for x in text_bodies])
        self._attachments = attachments

    def _parse_structure(self, parts, multipart_type, in_alternative,
                         attachments, html_bodies, text_bodies):
        """
        Parse a mail part structure.

        Inspired from: https://jmap.io/spec-mail.html#body-parts
        """
        text_length = sum(len(x) for x in text_bodies) if text_bodies else -1
        html_length = sum(len(x) for x in html_bodies) if html_bodies else -1
        if multipart_type == 'encrypted':
            # rfc1847
            proto = self.mail.get_param('protocol')
            if proto:
                self._extra_parameters.update({'encrypted': proto.lower()})

            content = [x for x in parts
                       if x.get_content_subtype() == 'octet-stream']
            if content:
                text_bodies.append(content[0])
                # Add also as an attachment
                attachments.append(content[0])
            else:
                log.warn('No encrypted data found')
            # Remove the 2 related encrypted part from list
            encaps = [x for x in parts
                      if x.get_content_type() == proto]
            parts.pop(parts.index(encaps[0]))
            parts.pop(parts.index(content[0]))
        for part in parts:
            is_multipart = part.is_multipart()
            is_inline = is_inline_part(part)
            sub_type = part.get_content_subtype()
            if is_multipart:
                alternative = in_alternative or sub_type == 'alternative'
                self._parse_structure(part.get_payload(),
                                      sub_type,
                                      alternative,
                                      attachments,
                                      html_bodies,
                                      text_bodies)
            else:
                if is_inline:
                    if multipart_type == 'alternative':
                        if sub_type == 'html':
                            html_bodies.append(part)
                        elif sub_type == 'plain':
                            text_bodies.append(part)
                        else:
                            attachments.append(part)
                    else:
                        if in_alternative:
                            if sub_type == 'plain':
                                html_bodies = []
                            if sub_type == 'html':
                                text_bodies = []

                        if sub_type == 'html':
                            html_bodies.append(part)
                        elif sub_type == 'plain':
                            text_bodies.append(part)
                        else:
                            attachments.append(part)
                    if not (text_bodies or html_bodies) and \
                       is_inline_part(part):
                        attachments.append(part)
                else:
                    attachments.append(part)

        if multipart_type == 'alternative' and html_bodies and text_bodies:
            if text_length == sum(len(x) for x in text_bodies) and \
               html_length != sum(len(x) for x in html_bodies):
                log.warn('Not sure about this html processing ...')
                for html in html_bodies:
                    text_bodies.append(html)
            if html_length == sum(len(x) for x in html_bodies) and \
               text_length != sum(len(x) for x in text_bodies):
                log.warn('Not sure about this text processing ...')
                for text in text_bodies:
                    html_bodies.append(text)

    @property
    def subject(self):
        """Mail subject."""
        s = decode_header(self.mail.get('Subject'))
        charset = s[0][1]
        if charset is not None:
            return s[0][0].decode(charset, "replace"). \
                encode("utf-8", "replace")
        else:
            try:
                return s[0][0].decode('utf-8', errors='ignore')
            except UnicodeError:
                log.warn('Invalid subject encoding')
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
        """List of attachments for this message."""
        return [MailAttachment(x) for x in self._attachments]

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
