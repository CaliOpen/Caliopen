# -*- coding: utf-8 -*-
"""Caliopen User tag parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import datetime
import logging
import types
import uuid

from caliopen_main.common.objects.base import ObjectStorable, ObjectUser
from caliopen_main.pi.objects import PIObject

from ..parameters.device import Device as DeviceParam
from ..store import (Device as ModelDevice,
                     DeviceLocation as ModelDeviceLocation)


log = logging.getLogger(__name__)


class DeviceLocation(ObjectStorable):
    """A known location related to a device."""

    _attrs = {
        'address': types.StringType,
        'type': types.StringType,
    }

    _model_class = ModelDeviceLocation
    _pkey_name = 'address'


class Device(ObjectUser):
    """Device related to an user."""

    _attrs = {
        'user_id': uuid.UUID,
        'device_id': uuid.UUID,
        'name': types.StringType,
        'type': types.StringType,
        'status': types.StringType,
        'last_seen': datetime.datetime,
        'date_insert': datetime.datetime,
        'privacy_features': types.DictType,
        'pi': PIObject,
        'locations': [DeviceLocation]
    }

    _model_class = ModelDevice
    _pkey_name = 'device_id'
    _json_model = DeviceParam

    def delete_db(self):
        """Delete a device in store."""
        self._db.delete()
        return True
