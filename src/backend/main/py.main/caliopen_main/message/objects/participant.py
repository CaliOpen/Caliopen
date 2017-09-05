# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types

from uuid import UUID
from caliopen_main.common.objects.base import ObjectJsonDictifiable
from ..store.participant import Participant as ModelParticipant
from ..store.participant_index import IndexedParticipant


class Participant(ObjectJsonDictifiable):
    """attachment's attributes, nested within message object"""

    _attrs = {
        'address': types.StringType,
        'contact_ids': [UUID],
        'label': types.StringType,
        'protocol': types.StringType,
        'type': types.StringType
    }

    _model_class = ModelParticipant
    _index_class = IndexedParticipant
