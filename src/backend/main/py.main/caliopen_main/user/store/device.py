# -*- coding: utf-8 -*-
"""Caliopen cassandra models related to device."""

from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid

import datetime
import pytz

from caliopen_storage.store.model import BaseModel, BaseUserType

from cassandra.cqlengine import columns

log = logging.getLogger(__name__)


class DeviceLocation(BaseUserType):
    """Device known location, base on IP."""

    address = columns.Text(primary_key=True)    # IP address with CIDR
    type = columns.Text()                       # home/work/etc
    country = columns.Text()
    privacy_features = columns.Map(columns.Text, columns.Text)


class Device(BaseModel):
    """User device."""

    user_id = columns.UUID(primary_key=True)
    device_id = columns.UUID(primary_key=True, default=uuid.uuid4)

    name = columns.Text()
    signature_key = columns.Text()          # secret key for device validation
    date_insert = columns.DateTime(required=True,
                                   default=datetime.datetime.now(tz=pytz.utc))
    type = columns.Text(required=True)      # laptop, desktop, smartphone, etc
    status = columns.Text(default='unknown')
    fingerprint = columns.Text()
    last_seen = columns.DateTime(default=datetime.datetime.now(tz=pytz.utc))
    privacy_features = columns.Map(columns.Text, columns.Text)
    locations = columns.List(columns.UserDefinedType(DeviceLocation))


class DevicePublicKey(BaseModel):
    """Device public key."""

    user_id = columns.UUID(primary_key=True)
    device_id = columns.UUID(primary_key=True, default=uuid.uuid4)
    fingerprint = columns.Text(primary_key=True)

    date_insert = columns.DateTime(required=True,
                                   default=datetime.datetime.now(tz=pytz.utc))
    is_current = columns.Boolean(default=False)
    public_key = columns.Text()


class DeviceConnectionLog(BaseModel):
    """Log a device connection."""

    user_id = columns.UUID(primary_key=True)
    device_id = columns.UUID(primary_key=True)
    date_insert = columns.DateTime(primary_key=True,
                                   default=datetime.datetime.now(tz=pytz.utc))
    ip_address = columns.Text(required=True)
    type = columns.Text()       # Connection type (login/logout)
    country = columns.Text()    # Geoip detected country
    privacy_features = columns.Map(columns.Text, columns.Text)
