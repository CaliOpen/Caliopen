# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from .user import NewUser, User, NewRule

from .types import InternetAddressType, PhoneNumberType

from .contact import Recipient, NewOrganization, Organization
from .contact import NewPostalAddress, PostalAddress
from .contact import NewEmail, Email, NewIM, IM, NewPhone, Phone
from .contact import NewSocialIdentity, SocialIdentity, NewPublicKey, PublicKey
from .contact import NewContact, Contact, ShortContact
from .tag import ResourceTag, NewUserTag, UserTag
from .device import NewDevice, Device
from .identity import Identity, LocalIdentity

__all__ = [
    'InternetAddressType', 'PhoneNumberType',
    'NewUser', 'User', 'NewRule',
    'Recipient', 'NewOrganization', 'Organization',
    'NewPostalAddress', 'PostalAddress',
    'NewEmail', 'Email', 'NewIM', 'IM', 'NewPhone', 'Phone',
    'NewSocialIdentity', 'SocialIdentity', 'NewPublicKey', 'PublicKey',
    'NewContact', 'Contact', 'ShortContact',
    'NewUserTag', 'UserTag', 'ResourceTag',
    'NewDevice', 'Device',
    'Identity', 'LocalIdentity'
]
