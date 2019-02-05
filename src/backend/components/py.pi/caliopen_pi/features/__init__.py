# -*- coding: utf-8 -*-
"""Caliopen privacy features namespace."""
from __future__ import absolute_import, print_function, unicode_literals

from .mail import InboundMailFeature
from .contact import ContactFeature
from .device import DeviceFeature


__all__ = ['InboundMailFeature', 'ContactFeature', 'DeviceFeature']
