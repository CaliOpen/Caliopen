# -*- coding: utf-8 -*-
"""Caliopen device privacy features extraction methods."""
from __future__ import absolute_import, print_function, unicode_literals

import os
import logging

from user_agents import parse as parse_ua
import geoip2.database as geoip

from caliopen_main.common.core.feature import PrivacyFeature

log = logging.getLogger(__name__)


class Singleton(object):
    """Basic singleton class."""

    _instance = None

    def __new__(cls, *args, **kwargs):
        """Create singleton instance of class."""
        if not isinstance(cls._instance, cls):
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance


class GeoipReader(Singleton):
    """Singleton for a geoip reader."""

    def __init__(self, filename):
        """A singleton around geoip reader."""
        self.reader = geoip.Reader(filename)


class DeviceFeature(object):
    """Compute feature for a device."""

    def __init__(self, user, conf=None):
        """Instanciate a new qualifier for an user."""
        self.user = user
        self.conf = conf
        self._features = PrivacyFeature.by_type('device')

    def process(self, device):
        """Process a device to compute it's privacy features and PI."""
        features = {}
        if device.user_agent:
            ua = parse_ua(device.user_agent)
            browser_version = ua.browser.version_string.lower()
            features.update({'browser_family': ua.browser.family.lower(),
                             'browser_version': browser_version,
                             'os_family': ua.os.family.lower(),
                             'os_version': ua.os.version_string.lower(),
                             'device_family': ua.device.family.lower(),
                             'device_type': self._get_device_type(ua)})
        # XXX processing IP address to detect some informations
        if device.ip_creation:
            features.update(self._process_ip_address(device.ip_creation))
        else:
            log.warn('No ip address found for device')
        return None, features

    def _get_device_type(self, ua):
        """Return guessed type of user agent."""
        if ua.is_mobile:
            return 'smartphone'
        if ua.is_tablet:
            return 'tablet'
        if ua.is_pc:
            return 'desktop'
        return 'other'

    def _process_ip_address(self, addr):
        geoip_file = self.conf.get('qualifiers', {}).get('geoip', {}). \
            get('file')
        if geoip_file and os.path.isfile(geoip_file):
            try:
                reader = GeoipReader(geoip_file).reader
                resp = reader.country(addr)
                return {'detected_country': resp.country.iso_code}
            except Exception as exc:
                log.exception('Error during geoip2 lookup %r' % exc)
        else:
            log.warn('Invalid geoip2 file configuration')
        return {}
