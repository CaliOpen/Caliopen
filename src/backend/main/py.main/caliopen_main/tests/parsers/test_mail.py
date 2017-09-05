"""Test mail message format processing."""

import unittest
import os

from datetime import datetime
from zope.interface.verify import verifyObject

from caliopen_storage.config import Configuration

if 'CALIOPEN_BASEDIR' in os.environ:
    conf_file = '{}/src/backend/configs/caliopen.yaml.template'. \
                format(os.environ['CALIOPEN_BASEDIR'])
else:
    conf_file = '../../../../../configs/caliopen.yaml.template'

Configuration.load(conf_file, 'global')

from caliopen_main.common.interfaces import IMessageParser
from caliopen_main.message.parsers.mail import MailMessage


def load_mail(filename):
    """Read email from fixtures of an user."""
    # XXX tofix: set fixtures in a more convenient way to not
    # have dirty hacking on relative path
    dir_path = os.path.dirname(os.path.realpath(__file__))
    path = '{}/../fixtures/mail'.format(dir_path)
    with open('{}/{}'.format(path, filename)) as f:
        data = f.read()
    return data


class TestMailFormat(unittest.TestCase):
    """Test formatting of a mail objet (rfc2822)."""

    def test_signed_mail(self):
        """Test parsing of a pgp signed mail."""
        data = load_mail('pgp_signed_1.eml')
        mail = MailMessage(data)
        self.assertTrue(verifyObject(IMessageParser, mail))
        self.assertTrue(len(mail.participants) > 1)
        self.assertEqual(len(mail.attachments), 1)
        self.assertEqual(mail.subject, 'signed content')
        self.assertTrue(isinstance(mail.date, datetime))

    def test_encrypted_mail(self):
        """Test parsing of a pgp encrypted mail."""
        data = load_mail('pgp_crypted_1.eml')
        mail = MailMessage(data)
        self.assertTrue(verifyObject(IMessageParser, mail))
        self.assertTrue(len(mail.participants) > 1)
        self.assertEqual(len(mail.attachments), 2)
        self.assertEqual(mail.subject, 'crypted content')
        self.assertTrue(isinstance(mail.date, datetime))

if __name__ == '__main__':
    unittest.main()
