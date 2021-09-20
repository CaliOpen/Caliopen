# -*- coding: utf-8 -*-
"""Caliopen device core classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid

from .store import Device as ModelDevice
from .store import DeviceLocation as ModelDeviceLocation
from .store import DeviceConnectionLog as ModelDeviceLog

from caliopen_storage.core.mixin import MixinCoreRelation, MixinCoreNested
from caliopen_main.common.core import BaseUserCore
from caliopen_main.common.core import PublicKey, BaseUserRelatedCore
from caliopen_main.common.parameters import NewPublicKey
from caliopen_main.device.parameters import NewDevice

from caliopen_pi.qualifiers import NewDeviceQualifier


log = logging.getLogger(__name__)


class DeviceLocation(BaseUserRelatedCore):
    """Locations defined for a device to restrict access."""

    _model_class = ModelDeviceLocation
    _pkey_name = 'address'


class DeviceLog(BaseUserRelatedCore):
    """Locations defined for a device to restrict access."""

    _model_class = ModelDeviceLog
    _pkey_name = 'timestamp'


class Device(BaseUserCore, MixinCoreRelation, MixinCoreNested):
    """User device core class."""

    _model_class = ModelDevice
    _pkey_name = 'device_id'

    _relations = {
        'public_keys': PublicKey,
        'locations': DeviceLocation,
    }

    @classmethod
    def create_from_parameter(cls, user, param, headers):
        """Create a device from API parameters."""
        dev = NewDevice()
        dev.device_id = param['device_id']
        dev.user_agent = headers.get('User-Agent')
        dev.ip_creation = headers.get('X-Forwarded-For')
        dev.status = 'verified' if 'status' not in param else param['status']
        qualifier = NewDeviceQualifier(user)
        qualifier.process(dev)
        if 'name' in param:
            # Used to set the default device
            dev.name = param['name']
        else:
            dev_name = 'new device'
            if 'device_type' in dev.privacy_features:
                dev_ext = dev.privacy_features['device_type']
                dev_name = '{} {}'.format(dev_name, dev_ext)
            dev.name = dev_name

        dev.type = dev.privacy_features.get('device_type', 'other')
        # Device ecdsa key
        dev_key = NewPublicKey()
        dev_key.key_id = uuid.uuid4()
        dev_key.resource_id = dev.device_id
        dev_key.resource_type = 'device'
        dev_key.label = 'ecdsa key'
        dev_key.kty = 'ec'
        dev_key.use = 'sig'
        dev_key.x = int(param['ecdsa_key']['x'], 16)
        dev_key.y = int(param['ecdsa_key']['y'], 16)
        dev_key.crv = param['ecdsa_key']['curve']
        # XXX Should be better design
        alg_map = {
            'P-256': 'ES256',
            'P-384': 'ES384',
            'P-521': 'ES512'
        }
        dev_key.alg = alg_map[dev_key.crv]
        return Device.create(user, dev, public_keys=[dev_key])

    @classmethod
    def create(cls, user, device, **related):
        """Create a new device for an user."""
        device.validate()
        attrs = {'device_id': device.device_id,
                 'type': device.type,
                 'name': device.name,
                 'user_agent': device.user_agent,
                 'ip_creation': device.ip_creation,
                 'privacy_features': device.privacy_features,
                 'status': device.status}

        core = super(Device, cls).create(user, **attrs)
        log.debug('Created device %s' % core.device_id)
        related_cores = {}
        for k, v in related.items():
            if k in cls._relations:
                for obj in v:
                    log.debug('Processing object %r' % obj.to_native())
                    # XXX check only one is_primary per relation using it
                    new_core = core._relations[k].create(user, **obj)
                    related_cores.setdefault(k, []).append(new_core.to_dict())
                    log.debug('Created related core %r' % new_core)
        return core

    def check_locations(self, ipaddr):
        """Check if the location of device is in related authorized ips."""
        if self.locations:
            for loc in self.locations:
                log.info("Testing cidr {0} with ip {1}".
                         format(loc.address, ipaddr))
        return True

    def _log_action(self, ipaddr, action):
        DeviceLog.create(self.user, self.device_id,
                         ipaddr=ipaddr,
                         type=action)

    def login(self, ipaddr):
        """Login action for a device."""
        log.info("Logging device {0} for user {1}".format(self.device_id,
                                                          self.user_id))
        if not self.check_locations(ipaddr):
            raise Exception("Device IP Address not in allowed locations")
        self._log_action(ipaddr, 'login')

    def logout(self, ipaddr):
        """Logout action for a device."""
        self._log_action(ipaddr, "logout")
