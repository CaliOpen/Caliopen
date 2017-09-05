# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from caliopen_storage.parameters import ReturnCoreObject

from .core import Contact, PublicKey
from .parameters import (Contact as ContactParam,
                         ShortContact as ContactShortParam,
                         Email as EmailParam,
                         Phone as PhoneParam,
                         IM as IMParam,
                         Organization as OrganizationParam,
                         PublicKey as PublicKeyParam,
                         PostalAddress as PostalAddressParam,
                         SocialIdentity as SocialIdentityParam)


class ReturnContact(ReturnCoreObject):

    _core_class = Contact
    _return_class = ContactParam


class ReturnShortContact(ReturnCoreObject):

    _core_class = Contact
    _return_class = ContactShortParam


class ReturnEmail(ReturnCoreObject):

    _return_class = EmailParam


class ReturnIM(ReturnCoreObject):

    _return_class = IMParam


class ReturnPhone(ReturnCoreObject):

    _return_class = PhoneParam


class ReturnAddress(ReturnCoreObject):

    _return_class = PostalAddressParam


class ReturnPublicKey(ReturnCoreObject):

    _core_class = PublicKey
    _return_class = PublicKeyParam


class ReturnSocialIdentity(ReturnCoreObject):

    _return_class = SocialIdentityParam


class ReturnOrganization(ReturnCoreObject):

    _return_class = OrganizationParam
