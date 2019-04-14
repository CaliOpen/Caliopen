# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.common.objects.base import ObjectUser

class Discussion(ObjectUser):

    _attrs = {
        'uris_hash': types.StringType,
        'uris': [types.StringType],
        'participants_hash': types.StringType,
        'participants': [types.StringType],
    }