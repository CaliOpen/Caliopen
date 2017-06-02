import unittest
import os

from datetime import datetime
from zope.interface.verify import verifyObject

from caliopen_storage.config import Configuration

import vobject

if 'CALIOPEN_BASEDIR' in os.environ:
    conf_file = '{}/src/backend/configs/caliopen.yaml.template'. \
                format(os.environ['CALIOPEN_BASEDIR'])
else:
    conf_file = '../../../../../configs/caliopen.yaml.template'

Configuration.load(conf_file, 'global')

#from caliopen_main.interfaces import IMessageParser
from caliopen_main.user.parameters import NewContact
from caliopen_main.parsers.vcard import parse_vcard

def load_vcard(filename):

    dir_path = os.path.dirname(os.path.realpath(__file__))
    path = '{}/../fixtures/vcard'.format(dir_path)
    with open('{}/{}'.format(path, filename)) as f:
        data = f.read()
    return data


class TestVcardFormat(unittest.TestCase):

    def test_name_vcard(self):
        data = load_vcard('vcard2.vcf')
        vcard = vobject.readOne(data)
        contact = parse_vcard(vcard)
        self.assertIsNotNone(contact.family_name)
        self.assertIsNotNone(contact.given_name)
    
    def test_address_vcard(self):
        data = load_vcard('vcard1.vcf')
        vcard = vobject.readOne(data)
        contact = parse_vcard(vcard)
        for i in contact.addresses:
            self.assertIsNotNone(i.city)

    def test_email_vcard(self):
        data = load_vcard('vcard1.vcf')
        vcard = vobject.readOne(data)
        contact = parse_vcard(vcard)
        for i in contact.emails:
            self.assertIsNotNone(i.address)

    def test_ims_vcard(self):
        data = load_vcard('vcard1.vcf')
        vcard = vobject.readOne(data)
        contact = parse_vcard(vcard)
        for i in contact.ims:
            self.assertIsNotNone(i.type)

if __name__ == '__main__':
    unittest.main()
