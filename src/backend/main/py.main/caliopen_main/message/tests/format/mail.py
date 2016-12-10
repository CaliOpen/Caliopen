"""Test mail message format processing."""

import unittest
import os
from datetime import datetime

from caliopen_main.message.format.mail import MailMessage


def load_mail(user, filename):
    """Read email from fixtures of an user."""
    # XXX tofix: set fixtures in a more convenient way to not
    # have dirty hacking on relative path
    if 'CALIOPEN_BASEDIR' in os.environ:
        base = os.environ['CALIOPEN_BASEDIR']
    else:
        base = '../../../../../../../..'
    path = '{}/devtools/fixtures/mbox'.format(base)
    with open('{}/{}/{}'.format(path, user, filename)) as f:
        data = f.read()
    return data


class TestMailFormat(unittest.TestCase):

    """Test formatting of a mail objet (rfc2822)."""

    def test_01(self):
        data = load_mail('test@caliopen.local', 'test_1.eml')
        mail = MailMessage(data)
        self.assertEqual(mail.recipients['cc'], [])
        self.assertEqual(mail.recipients['bcc'], [])
        self.assertNotEqual(mail.recipients['from'], [])
        self.assertNotEqual(mail.recipients['to'], [])
        self.assertEqual(len(mail.recipients['from']), 1)
        self.assertEqual(len(mail.parts), 1)
        subject = "Dr. Zoidberg, that doesn't make sense. But, okay!"
        self.assertEqual(mail.subject, subject)
        self.assertTrue(isinstance(mail.date, datetime))


if __name__ == '__main__':
    unittest.main()
