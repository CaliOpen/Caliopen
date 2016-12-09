# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

from schematics.models import Model
from schematics.types import (StringType, IntType, URLType,
                              UUIDType, DateTimeType, BooleanType)
from schematics.types.compound import ListType, ModelType, DictType
from schematics.transforms import blacklist

from .types import InternetAddressType, PhoneNumberType

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
                'linkedin', 'ello', 'instagram', 'tumblr', 'skype']

KEY_CHOICES = ['rsa', 'gpg', 'ssh']


RECIPIENT_TYPES = ['to', 'from', 'cc', 'bcc']


class Recipient(Model):

    """Store a contact reference and one of it's address used in a message."""

    address = StringType(required=True)
    contact_id = UUIDType(serialize_when_none=False)
    type = StringType(required=True, choices=RECIPIENT_TYPES)


class NewOrganization(Model):

    """Input structure for a new organization."""

    department = StringType(serialize_when_none=False)
    is_primary = BooleanType(default=False, serialize_when_none=False)
    job_description = StringType(serialize_when_none=False)
    label = StringType(required=True)
    name = StringType(required=True)
    title = StringType(serialize_when_none=False)
    # XXX Add enumerated list
    type = StringType(choices=ORG_TYPES, serialize_when_none=False)


class Organization(NewOrganization):

    """Existing organization."""

    contact_id = UUIDType(serialize_when_none=False)
    deleted = BooleanType(default=False, serialize_when_none=False)
    organization_id = UUIDType(required=True)
    user_id = UUIDType(serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}


class NewPostalAddress(Model):

    """Input structure for a new postal address."""

    address_id = StringType(serialize_when_none=False)
    city = StringType(required=True)
    country = StringType(serialize_when_none=False)
    is_primary = BooleanType(default=False, serialize_when_none=False)
    label = StringType(serialize_when_none=False)
    postal_code = StringType(serialize_when_none=False)
    region = StringType(serialize_when_none=False)
    street = StringType(serialize_when_none=False)
    type = StringType(choices=ADDRESS_TYPES, serialize_when_none=False)


class PostalAddress(NewPostalAddress):

    """Existing postal address."""

    address_id = UUIDType(required=True)
    contact_id = UUIDType(serialize_when_none=False)
    user_id = UUIDType(serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}


class NewEmail(Model):

    """Input structure for a new email."""
    address = InternetAddressType(required=True)
    is_primary = BooleanType(default=False, serialize_when_none=False)
    label = StringType(serialize_when_none=False)
    type = StringType(choices=EMAIL_TYPES, default='other', serialize_when_none=False)


class Email(NewEmail):

    """Existing email."""

    contact_id = UUIDType(serialize_when_none=False)
    email_id = UUIDType(required=True)
    user_id = UUIDType(serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}


class NewIM(Model):

    """Input structure for a new IM."""

    address = InternetAddressType(required=True)
    is_primary = BooleanType(default=False, serialize_when_none=False)
    label = StringType(serialize_when_none=False)
    protocol = StringType(serialize_when_none=False)
    type = StringType(choices=IM_TYPES, default='other', serialize_when_none=False)


class IM(NewIM):

    """Existing IM."""

    contact_id = UUIDType(serialize_when_none=False)
    im_id = UUIDType(required=True)
    user_id = UUIDType(serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}


class NewPhone(Model):

    """Input structure for a new phone."""

    is_primary = BooleanType(default=False, serialize_when_none=False)
    number = PhoneNumberType(required=True)
    type = StringType(choices=PHONE_TYPES, default='other', serialize_when_none=False)
    uri = URLType(serialize_when_none=False)


class Phone(NewPhone):

    """Existing phone."""

    contact_id = UUIDType(serialize_when_none=False)
    phone_id = UUIDType(required=True)
    user_id = UUIDType(serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}


class NewSocialIdentity(Model):

    """Input structure for a new social identity."""

    infos = DictType(StringType, default=lambda: {}, serialize_when_none=False)
    name = StringType(required=True)
    type = StringType(choices=SOCIAL_TYPES, serialize_when_none=False)


class SocialIdentity(NewSocialIdentity):

    """Existing social identity."""

    contact_id = UUIDType(serialize_when_none=False)
    identity_id = UUIDType(required=True)
    user_id = UUIDType(serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}


class NewPublicKey(Model):

    """Input structure for a new public key."""

    expire_date = DateTimeType(serialize_when_none=False)
    fingerprint = StringType(serialize_when_none=False)
    key = StringType(required=True)
    name = StringType(required=True)
    size = IntType(serialize_when_none=False)
    type = StringType(choices=KEY_CHOICES, serialize_when_none=False)


class PublicKey(NewPublicKey):

    """Existing public key."""

    contact_id = UUIDType(serialize_when_none=False)
    date_insert = DateTimeType(required=True)
    date_update = DateTimeType(serialize_when_none=False)
    user_id = UUIDType(serialize_when_none=False)

    class Options:
        roles = {'default': blacklist('user_id', 'contact_id')}


class NewContact(Model):

    """Input structure for a new contact."""

    additional_name = StringType(serialize_when_none=False)
    addresses = ListType(ModelType(NewPostalAddress), default=lambda: [], serialize_when_none=False)
    emails = ListType(ModelType(NewEmail), default=lambda: [], serialize_when_none=False)
    family_name = StringType(serialize_when_none=False)
    given_name = StringType(serialize_when_none=False)
    groups = ListType(StringType, serialize_when_none=False)
    identities = ListType(ModelType(NewSocialIdentity), default=lambda: [], serialize_when_none=False)
    ims = ListType(ModelType(NewIM), default=lambda: [], serialize_when_none=False)
    infos = DictType(StringType, serialize_when_none=False)
    name_prefix = StringType(serialize_when_none=False)
    name_suffix = StringType(serialize_when_none=False)
    organizations = ListType(ModelType(NewOrganization), default=lambda: [], serialize_when_none=False)
    phones = ListType(ModelType(NewPhone), default=lambda: [], serialize_when_none=False)
    privacy_features = DictType(StringType, default=lambda: {}, serialize_when_none=False)
    privacy_index = IntType(default=0, serialize_when_none=False)
    public_keys = ListType(ModelType(NewPublicKey), default=lambda: [], serialize_when_none=False)
    tags = ListType(StringType, serialize_when_none=False)


class Contact(NewContact):

    """Existing contact."""
    addresses = ListType(ModelType(PostalAddress), default=lambda: [], serialize_when_none=False)
    avatar = StringType(default='avatar.png', serialize_when_none=False)
    contact_id = UUIDType(required=True)
    date_insert = DateTimeType(serialize_when_none=False)
    date_update = DateTimeType(serialize_when_none=False)
    deleted = BooleanType(serialize_when_none=False)
    emails = ListType(ModelType(Email), default=lambda: [], serialize_when_none=False)
    identities = ListType(ModelType(SocialIdentity), default=lambda: [], serialize_when_none=False)
    ims = ListType(ModelType(IM), default=lambda: [], serialize_when_none=False)
    organizations = ListType(ModelType(Organization), default=lambda: [], serialize_when_none=False)
    phones = ListType(ModelType(Phone), default=lambda: [], serialize_when_none=False)
    public_keys = ListType(ModelType(PublicKey), default=lambda: [], serialize_when_none=False)
    # XXX not such default here
    title = StringType(serialize_when_none=False)
    user_id = UUIDType(required=True)


class ShortContact(Model):

    """Input structure for contact in short form."""

    contact_id = UUIDType(required=True)
    family_name = StringType(serialize_when_none=False)
    given_name = StringType(serialize_when_none=False)
    tags = ListType(StringType, serialize_when_none=False)
    title = StringType(serialize_when_none=False)
