# -*- coding: utf-8 -*-
"""User return object structure."""

from __future__ import absolute_import, print_function, unicode_literals

from caliopen_storage.parameters import ReturnCoreObject
from ..core import User, RemoteIdentity
from ..parameters import User as UserParam
from ..parameters import RemoteIdentity as RemoteIdentityParam


class ReturnUser(ReturnCoreObject):
    """Return object for ``User`` core."""

    _core_class = User
    _return_class = UserParam


class ReturnRemoteIdentity(ReturnCoreObject):
    """Return object for ``RemoteIdentity`` core."""

    _core_class = RemoteIdentity
    _return_class = RemoteIdentityParam
