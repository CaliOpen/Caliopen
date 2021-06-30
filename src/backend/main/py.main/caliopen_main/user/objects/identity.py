# -*- coding: utf-8 -*-
"""Caliopen message object classes."""

import types
import datetime
from uuid import UUID

from caliopen_main.common.objects.base import ObjectUser

from ..store.identity import UserIdentity as ModelUserIdentity


class Credentials():
    _attrs = {}


class UserIdentity(ObjectUser):
    """Local or remote identity related to an user."""

    _attrs = {
        'credentials': Credentials,
        'display_name': str,
        'identifier': str,  # for example: me@caliopen.org
        'identity_id': UUID,
        'infos': dict,
        'last_check': datetime.datetime,
        'protocol': str,  # for example: smtp, imap, mastodon
        'status': str,  # for example : active, inactive, deleted
        'type': str,  # for example : local, remote
        'user_id': UUID
    }

    _model_class = ModelUserIdentity
    _pkey_name = 'identity_id'
    _db = None  # model instance with data from db
