# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
from caliopen_storage.core import BaseCore
from ..store.hash_lookup import HashLookup as ModelHashLookup

log = logging.getLogger(__name__)


class HashLookup(BaseCore):
    """"""

    _model_class = ModelHashLookup
    _pkey_name = 'key'