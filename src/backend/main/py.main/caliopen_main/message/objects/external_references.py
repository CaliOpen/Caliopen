# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

from caliopen_main.common.objects.base import ObjectJsonDictifiable
from ..store.external_references import ExternalReferences as ModelExtRef
from ..store.external_references_index import IndexedExternalReferences


class ExternalReferences(ObjectJsonDictifiable):
    """External references, nested within message object."""

    _attrs = {
        'ancestors_ids': [str],
        'message_id': str,
        'parent_id': str
    }

    _model_class = ModelExtRef
    _index_class = IndexedExternalReferences
