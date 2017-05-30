from caliopen_main.user.parameters.contact import (NewContact, NewEmail,
                                        NewPostalAddress, NewPublicKey, NewPhone,
                                        NewOrganization, NewIM, Contact, PHONE_TYPES,
                                        ADDRESS_TYPES, EMAIL_TYPES, KEY_CHOICES, ORG_TYPES,
                                        IM_TYPES)

from schematics.types import UUIDType

from cryptography import x509
from cryptography.hazmat.backends.openssl import backend
from cryptography.hazmat.backends import default_backend

import ssl
import base64

from caliopen_main.user.parameters.types import PhoneNumberType
from caliopen_main.user.parameters.types import InternetAddressType

from caliopen_main.user.core.contact import Contact as CoreContact
from caliopen_main.user.core.user import User as CoreUser

from caliopen_pgp.keys.hkp import HKPDiscovery
from caliopen_pgp.keys.keybase import KeybaseDiscovery
from caliopen_pgp.keys.rfc7929 import DNSDiscovery

def parse_vcard(vcard):

    new_contact = NewContact()

    n = False
    for parcours in vcard.contents:
        if parcours == 'n':
            n = True

    if n:
        new_contact.family_name = vcard.contents['n'][0].value.family

        new_contact.given_name = vcard.contents['n'][0].value.given

        if vcard.contents['n'][0].value.additional:
            for a in vcard.contents['n'][0].value.additional:
                if len(a) == 1:
                    new_contact.additional_name = vcard.contents['n'][0].value.additional
                else:
                    liste = vcard.contents['n'][0].value.additional
                    new_contact.additional_name = liste[0]

        new_contact.name_prefix = vcard.contents['n'][0].value.prefix

        if vcard.contents['n'][0].value.suffix:
            for a in vcard.contents['n'][0].value.suffix:
                if len(a) == 1:
                    new_contact.additional_name = vcard.contents['n'][0].value.suffix
                else:
                    liste = vcard.contents['n'][0].value.suffix
                    new_contact.name_suffix = liste[0]
    else:
        for v in vcard.contents:
            if v == 'sn':
                for sn in vcard.contents['sn']:
                    new_contact.family_name = sn.value

            elif v == 'cn':
                for cn in vcard.contents['cn']:
                    ind = 0
                    prems = False
                    for a in cn.value:
                        if a != ' ' and not prems:
                            ind += 1
                        else:
                            prems = True
                            new_contact.given_name = cn.value[:ind]
                            new_contact.family_name = cn.value[ind + 1:]

            elif v == 'name':
                for name in vcard.contents['name']:
                    ind = 0
                    prems = False
                    for a in name.value:
                        if a == ' ' and not prems:
                            ind += 1
                        else:
                            prems = True
                            new_contact.given_name = name.value[ind + 1:]
                            new_contact.family_name = name.value[:ind]

            elif v == 'fn':
                for fn in vcard.contents['fn']:
                    ind = 0
                    prems = False
                    for a in fn.value:
                        if a != ' ' and not prems:
                            ind += 1
                        else:
                            prems = True
                            new_contact.given_name = fn.value[:ind]
                            new_contact.family_name = fn.value[ind + 1:]

    for v in vcard.contents:
        if v == 'adr':
            for ad in vcard.contents['adr']:
                add = NewPostalAddress()
                add.city = ad.value.city
                add.country = ad.value.country
                add.is_primary = False
                add.postal_code = ad.value.code
                add.region = ad.value.region
                add.street = ad.value.street
                for i in ADDRESS_TYPES:
                    if i == ad.type_param:
                        add.type = ad.type_param
                if not add.type:
                    add.type = ADDRESS_TYPES[2]
                new_contact.addresses.append(add)

        elif v == 'email':
            for mail in vcard.contents['email']:
                email_tmp = NewEmail()
                ad = InternetAddressType.validate_email(InternetAddressType(),mail.value)
                email_tmp.address = ad
                email_tmp.is_primary = False
                if mail.params:
                    if mail.params.get('TYPE')[0]:
                        for i in EMAIL_TYPES:
                            if i == mail.params.get('TYPE')[0]:
                                email_tmp.type = i
                new_contact.emails.append(email_tmp)
################################################################################################
                
                key1 = HKPDiscovery(email_tmp)
                key2 = KeybaseDiscovery(email_tmp)
                key3 = DNSDiscovery(email_tmp)
                """
                print("")
                #for i in key1.find_by_mail(email_tmp.address):
                for i in key2.find_by_type(email_tmp.address):
                    print(i.id)
                    print(i._pgpkey)
                    print(i.version)
                    print(i.created)
                    print(i.is_expired)
                    print(i.keyid)
                    print(i.fingerprint)
                    print(i.algorithm)
                    print(i.userids)
                #print(key2.find_by_type("Aymeric Barantal",'github'))
                #print(key3.find_by_mail(email_tmp.address))
                print("")
                """
################################################################################################
        elif v == 'impp':
            for i in vcard.contents['impp']:
                impp = NewIM()
                impp_tmp = InternetAddressType.validate_email(InternetAddressType(),i.value)
                impp.address = impp_tmp
                impp.is_primary = False
                if i.params:
                    for j in IM_TYPES:
                        if j == i.params.get('TYPE')[0]:
                            impp.type = j
                new_contact.ims.append(impp)

        elif v == 'org':
            for o in vcard.contents['org']:
                for orga in o.value:
                    org = NewOrganization()
                    org.is_primary = False
                    org.label = orga
                    org.name = orga
                    new_contact.organizations.append(org)

        elif v == 'tel':
            for tel in vcard.contents['tel']:
                phone = NewPhone()
                phone.is_primary = False
                number = PhoneNumberType.validate_phone(PhoneNumberType(),tel.value)
                phone.number = number
                new_contact.phones.append(phone)

        elif v == 'key':
            test = False
            for key in vcard.contents['key']:
                if key.params:
                    if key.params.get('ENCODING'):
                        """
                        if key.params.get('ENCODING')[0] == 'b': 
                            key = attr.split(';', 2)[1].split(':', 3)[2]

                            der = base64.decodestring(key)
                            pem = ssl.DER_cert_to_PEM_cert(der)
                            
                            tmp = x509.load_der_x509_certificate(str(vcard.contents['key'][0].value), backend)
                            print("")
                            print("")
                            print(dir(tmp))
                            print("")
                            print(tmp.__dict__)
                            print("")
                            print(tmp.fingerprint)
                            print("")
                            print(tmp.signature)
                            print("")
                            print("")
                            #ke.key = tmp.getPublicKey()
                            #ke.fingerprint = str(tmp.fingerprint)
                            #ke.key = tmp.public_key    # Erreur au niveau du type, a revoir = pas de type
                        """ 
                    else:
                        test = True
                if test:
                    ke = NewPublicKey()

                    ke.key = vcard.contents['key'][0].value
                    if "1024" in key.value:
                        ke.size = 1024
                    elif "2048" in key.value:
                        ke.size = 2048
                    elif "4096" in key.value:
                        ke.size = 4096
                    if(key.params):
                        for j in KEY_CHOICES:
                            if j == 'gpg':
                                j = 'pgp'
                            j = j.upper()
                            if j == key.params.get('TYPE'):
                                j = j.lower()
                                if j == 'pgp':
                                    j = 'gpg'
                                ke.type = j
                    ke.name = ('key{}{}'.format(ke.type,ke.size))
                    #print(ke.name)
                    new_contact.public_keys.append(ke)
    return new_contact

def parse_vcards(vcards):

    for v in vcards:
        yield parse_vcard(v)
