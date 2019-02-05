# -*- coding: utf-8 -*-
"""Caliopen user message qualification logic."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
from caliopen_storage.config import Configuration

from caliopen_main.common.core.feature import marshal_features

from ..features import DeviceFeature


log = logging.getLogger(__name__)


class NewDeviceQualifier(object):
    """Process an user device and enhance informations."""

    def __init__(self, user):
        """Create a new instance of an user device qualifier."""
        self.user = user
        self.conf = Configuration('global').configuration

    def process(self, device):
        """Process a device to qualify it."""
        extractor = DeviceFeature(self.user, self.conf)
        pi, features = extractor.process(device)
        device.privacy_features = marshal_features(features)
        device.pi = pi
        return True
