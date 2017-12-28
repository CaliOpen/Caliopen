# -*- coding: utf-8 -*-
"""Caliopen User tag parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals
import uuid
import datetime

from .base import ObjectJsonDictifiable
from ..store.tag import ResourceTag as ModelResourceTag
from ..store.tag import IndexedResourceTag

import logging
log = logging.getLogger(__name__)


class ResourceTag(ObjectJsonDictifiable):
    """Tag nested in resources."""

    _attrs = {
        'date_insert': datetime.datetime,
        'importance_level': int,
        'name': str,
        'tag_id': uuid.UUID,
        'type': str,
    }

    _model_class = ModelResourceTag
    _pkey_name = 'tag_id'
    _index_class = IndexedResourceTag
