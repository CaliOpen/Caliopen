# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from .user import NewUser, User, NewRule

from caliopen_main.common.parameters.types import InternetAddressType, PhoneNumberType

from .tag import NewUserTag, UserTag
from .device import NewDevice, Device
from .identity import Identity, LocalIdentity, NewRemoteIdentity, RemoteIdentity

__all__ = [
    'InternetAddressType', 'PhoneNumberType',
    'NewUser', 'User', 'NewRule', 'Recipient',
    'NewUserTag', 'UserTag', 'NewDevice', 'Device',
    'Identity', 'LocalIdentity', 'NewRemoteIdentity', 'RemoteIdentity',
]
