# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

from schematics.models import Model
from schematics.types import (StringType, IntType, URLType,
                              UUIDType, DateTimeType, BooleanType)
from schematics.types.compound import ListType, ModelType, DictType
from schematics.transforms import blacklist

from caliopen_main.common.parameters.types import InternetAddressType, PhoneNumberType
from caliopen_main.common.parameters.tag import ResourceTag

from caliopen_main.pi.parameters import PIParameter
import caliopen_storage.helpers.json as helpers

ORG_TYPES = ['work', 'home']
ADDRESS_TYPES = ['work', 'home', 'other']
EMAIL_TYPES = ['work', 'home', 'other']
IM_TYPES = ['work', 'home', 'other', 'netmeeting']

PHONE_TYPES = ['assistant', 'callback', 'car', 'company_main',
               'fax', 'home', 'home_fax', 'isdn', 'main', 'mobile',
               'other', 'other_fax', 'pager', 'radio', 'telex',
               'tty_tdd', 'work', 'work_fax', 'work_mobile', 'work_pager']
# XXX : use configuration instead ?
SOCIAL_TYPES = ['facebook', 'twitter', 'google', 'github', 'bitbucket',
                'linkedin', 'ello', 'instagram', 'tumblr', 'skype', 'mastodon']

KEY_CHOICES = ['rsa', 'gpg', 'ssh']


RECIPIENT_TYPES = ['to', 'from', 'cc', 'bcc']


class Recipient(Model):

    """Store a contact reference and one of it's address used in a message."""

    address = StringType(required=True)
    contact_id = UUIDType()
    type = StringType(required=True, choices=RECIPIENT_TYPES)

    class Options:
        serialize_when_none = False


class NewOrganization(Model):

    """Input structure for a new organization."""

    department = StringType()
    is_primary = BooleanType(default=False)
    job_description = StringType()
    label = StringType()
    name = StringType(required=True)
    title = StringType()
    # XXX Add enumerated list
    type = StringType()

    class Options:
        serialize_when_none = False


class Organization(NewOrganization):

    """Existing organization."""

    contact_id = UUIDType()
    deleted = BooleanType(default=False)
    organization_id = UUIDType()
    user_id = UUIDType()

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}
        serialize_when_none = False


class NewPostalAddress(Model):

    """Input structure for a new postal address."""

    address_id = StringType()
    city = StringType()
    country = StringType()
    is_primary = BooleanType(default=False)
    label = StringType()
    postal_code = StringType()
    region = StringType()
    street = StringType()
    type = StringType(choices=ADDRESS_TYPES)

    class Options:
        serialize_when_none = False


class PostalAddress(NewPostalAddress):

    """Existing postal address."""

    address_id = UUIDType()
    contact_id = UUIDType()
    user_id = UUIDType()

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}
        serialize_when_none = False


class NewEmail(Model):

    """Input structure for a new email."""
    address = InternetAddressType(required=True)
    is_primary = BooleanType(default=False)
    label = StringType()
    type = StringType(choices=EMAIL_TYPES, default='other')

    class Options:
        serialize_when_none = False


class Email(NewEmail):

    """Existing email."""

    email_id = UUIDType()

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}
        serialize_when_none = False


class NewIM(Model):

    """Input structure for a new IM."""

    address = InternetAddressType(required=True)
    is_primary = BooleanType(default=False)
    label = StringType()
    protocol = StringType()
    type = StringType(choices=IM_TYPES, default='other')

    class Options:
        serialize_when_none = False


class IM(NewIM):

    """Existing IM."""

    contact_id = UUIDType()
    im_id = UUIDType()
    user_id = UUIDType()

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}
        serialize_when_none = False


class NewPhone(Model):

    """Input structure for a new phone."""

    is_primary = BooleanType(default=False)
    number = StringType(required=True)
    normalized_number = PhoneNumberType()
    type = StringType(choices=PHONE_TYPES, default='other')
    uri = StringType()

    class Options:
        serialize_when_none = False


class Phone(NewPhone):

    """Existing phone."""

    contact_id = UUIDType()
    phone_id = UUIDType()
    user_id = UUIDType()

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}
        serialize_when_none = False


class NewSocialIdentity(Model):

    """Input structure for a new social identity."""

    infos = DictType(StringType, default=lambda: {})
    name = StringType(required=True)
    type = StringType(choices=SOCIAL_TYPES, required=True)

    class Options:
        serialize_when_none = False


class SocialIdentity(NewSocialIdentity):

    """Existing social identity."""

    contact_id = UUIDType()
    social_id = UUIDType()
    user_id = UUIDType()

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}
        serialize_when_none = False


class NewPublicKey(Model):

    """Input structure for a new public key."""

    expire_date = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    fingerprint = StringType()
    key = StringType(required=True)
    name = StringType(required=True)
    size = IntType()
    type = StringType(choices=KEY_CHOICES)

    class Options:
        serialize_when_none = False


class PublicKey(NewPublicKey):

    """Existing public key."""

    contact_id = UUIDType()
    date_insert = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    date_update = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    user_id = UUIDType()

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}
        serialize_when_none = False


class NewContact(Model):

    """Input structure for a new contact."""

    additional_name = StringType()
    addresses = ListType(ModelType(NewPostalAddress), default=lambda: [])
    emails = ListType(ModelType(NewEmail), default=lambda: [])
    family_name = StringType()
    given_name = StringType()
    title = StringType()
    groups = ListType(StringType)
    identities = ListType(ModelType(NewSocialIdentity), default=lambda: [])
    ims = ListType(ModelType(NewIM), default=lambda: [], )
    infos = DictType(StringType)
    name_prefix = StringType()
    name_suffix = StringType()
    organizations = ListType(ModelType(NewOrganization), default=lambda: [])
    phones = ListType(ModelType(NewPhone), default=lambda: [])
    privacy_features = DictType(StringType, default=lambda: {})
    public_keys = ListType(ModelType(NewPublicKey), default=lambda: [])
    tags = ListType(ModelType(ResourceTag), default=lambda: [])

    class Options:
        serialize_when_none = False


class Contact(NewContact):

    """Existing contact."""

    addresses = ListType(ModelType(PostalAddress), default=lambda: [])
    avatar = StringType(default='avatar.png')
    contact_id = UUIDType()
    date_insert = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    date_update = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    deleted = BooleanType()
    emails = ListType(ModelType(Email), default=lambda: [])
    identities = ListType(ModelType(SocialIdentity), default=lambda: [])
    ims = ListType(ModelType(IM), default=lambda: [])
    organizations = ListType(ModelType(Organization), default=lambda: [])
    phones = ListType(ModelType(Phone), default=lambda: [])
    public_keys = ListType(ModelType(PublicKey), default=lambda: [])
    pi = ModelType(PIParameter)    
    user_id = UUIDType()

    class Options:
        serialize_when_none = False


class ShortContact(Model):

    """Input structure for contact in short form."""

    contact_id = UUIDType()
    family_name = StringType()
    given_name = StringType()
    tags = ListType(ModelType(ResourceTag), default=lambda: [])
    title = StringType()
    pi = ModelType(PIParameter)

    class Options:
        serialize_when_none = False
