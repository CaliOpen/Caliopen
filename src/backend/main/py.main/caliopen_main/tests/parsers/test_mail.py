"""Test mail message format processing."""

import unittest
import os
import logging


from datetime import datetime
from zope.interface.verify import verifyObject

from caliopen_storage.config import Configuration

if 'CALIOPEN_BASEDIR' in os.environ:
    basedir = os.environ['CALIOPEN_BASEDIR']
else:
    # Guess something, we shouldn't and expect stricrly an env variable
    basedir = '../../../../..'

conf_file = '{}/src/backend/configs/caliopen.yaml.template'.format(basedir)
raw_directory = '{}/devtools/fixtures/raw_emails'.format(basedir)

Configuration.load(conf_file, 'global')

from caliopen_main.common.interfaces import IMessageParser  # noqa
from caliopen_main.message.parsers.mail import MailMessage  # noqa


logging.basicConfig()


def load_raw_mail(filename):
    """Read email from raw_directory."""
    with open('{}/{}'.format(raw_directory, filename)) as f:
        data = f.read()
    return data


def load_mail_relative(filename):
    """Read email from fixtures of this package."""
    dir_path = os.path.dirname(os.path.realpath(__file__))
    path = '{}/../fixtures/mail'.format(dir_path)
    with open('{}/{}'.format(path, filename)) as f:
        data = f.read()
    return data


class TestMailFormat(unittest.TestCase):
    """Test formatting of a mail objet (rfc2822)."""

    def test_signed_mail(self):
        """Test parsing of a pgp signed mail."""
        data = load_mail_relative('pgp_signed_1.eml')
        mail = MailMessage(data)
        self.assertTrue(verifyObject(IMessageParser, mail))
        self.assertTrue(len(mail.participants) > 1)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.attachments[0].is_inline, False)
        self.assertEqual(mail.subject, 'signed content')
        self.assertEqual(mail.body_html, '')
        self.assertTrue(len(mail.body_plain) > 0)
        self.assertTrue(isinstance(mail.date, datetime))

    def test_encrypted_mail(self):
        """Test parsing of a pgp encrypted mail."""
        data = load_mail_relative('pgp_crypted_1.eml')
        mail = MailMessage(data)
        self.assertTrue(verifyObject(IMessageParser, mail))
        self.assertTrue(len(mail.participants) > 1)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.attachments[0].is_inline, False)
        self.assertEqual(mail.subject, 'crypted content')
        self.assertTrue(isinstance(mail.date, datetime))
        expected = {'encrypted': 'application/pgp-encrypted', 'lists': []}
        self.assertEqual(mail.extra_parameters, expected)

    def test_only_png(self):
        """Test a plain mail having only an image/png."""
        data = load_mail_relative('png.eml')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.attachments[0].is_inline, False)
        self.assertEqual(mail.attachments[0].content_type, 'image/png')
        self.assertEqual(mail.body_html, '')
        self.assertEqual(mail.body_plain, '')

    def test_html_alternative(self):
        """Test a multipart/alternative mail in html format."""
        data = load_mail_relative('alternative1.eml')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 0)
        self.assertNotEqual(mail.body_html, '')
        self.assertEqual(mail.body_plain, '')


class TestRawMail(unittest.TestCase):
    """Parse email from devtools/fixtures/raw_emails for particularities"""

    def test_multipart_html(self):
        data = load_raw_mail('multipart-html')
        mail = MailMessage(data)
        self.assertEqual(mail.attachments, [])
        self.assertTrue(len(mail.body_html) > 0)
        self.assertTrue(len(mail.body_plain) > 0)

    def test_multipart_signed(self):
        data = load_raw_mail('multipart-signed')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.attachments[0].content_type,
                         'application/pgp-signature')
        self.assertEqual(mail.attachments[0].is_inline, False)
        self.assertTrue(len(mail.body_html) == 0)
        self.assertTrue(len(mail.body_plain) > 0)

    def test_html_inline_image(self):
        data = load_raw_mail('html-with-inlined-image')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.attachments[0].content_type, 'image/png')
        self.assertEqual(mail.attachments[0].is_inline, True)
        self.assertTrue(len(mail.body_html) > 0)
        self.assertTrue(len(mail.body_plain) > 0)

    def test_spam_multipart(self):
        data = load_raw_mail('spam-multipart')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 0)
        self.assertTrue(len(mail.body_html) > 0)
        self.assertTrue(len(mail.body_plain) > 0)

    def test_invalid_utf8(self):
        data = load_raw_mail('invalid-utf-8')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 0)
        self.assertTrue(len(mail.body_html) > 0)
        self.assertTrue(len(mail.body_plain) > 0)

    def test_multipart_mixed(self):
        data = load_raw_mail('multipart-mixed-mailinglist')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.attachments[0].content_type,
                         'application/pgp-signature')
        self.assertEqual(mail.attachments[0].is_inline, False)
        self.assertEqual(mail.body_html, '')
        self.assertTrue(len(mail.body_plain) > 0)

    def test_plain_mail_encoded(self):
        data = load_raw_mail('email-with-iso-8859-1-encoding')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 0)
        self.assertTrue(len(mail.body_html) == 0)
        self.assertTrue(len(mail.body_plain) > 0)

    def test_pgp_encrypted(self):
        data = load_raw_mail('signed-and-encrypted')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.attachments[0].is_inline, False)
        self.assertTrue(len(mail.body_html) == 0)
        self.assertTrue(len(mail.body_plain) > 0)
        expected = {'encrypted': 'application/pgp-encrypted', 'lists': []}
        self.assertEqual(mail.extra_parameters, expected)

    def test_inline_pgp_signed_and_image(self):
        data = load_raw_mail('pgp-inline-signed-and-attachment')
        mail = MailMessage(data)
        self.assertEqual(len(mail.attachments), 2)
        self.assertTrue('application/pgp-signature'
                        in [x.content_type for x in mail.attachments])
        self.assertEqual(mail.attachments[0].is_inline, False)
        self.assertTrue('image/png'
                        in [x.content_type for x in mail.attachments])
        self.assertEqual(mail.attachments[1].is_inline, False)

        self.assertTrue(len(mail.body_html) == 0)
        self.assertTrue(len(mail.body_plain) > 0)
        expected = {'encrypted': 'pgp-inline', 'lists': []}
        self.assertEqual(mail.extra_parameters, expected)
