# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.common.objects.base import ObjectJsonDictifiable
from ..store.external_references import ExternalReferences as ModelExtRef
from ..store.external_references_index import IndexedExternalReferences


class ExternalReferences(ObjectJsonDictifiable):
    """external references, nested within message object"""

    _attrs = {
        'ancestors_ids': [types.StringType],
        'message_id': types.StringType,
        'parent_id': types.StringType
    }

    _model_class = ModelExtRef
    _index_class = IndexedExternalReferences
