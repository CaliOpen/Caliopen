# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from caliopen_main.common.objects.base import ObjectJsonDictifiable
from ..store.participant import Participant as ModelParticipant
from ..store.participant_index import IndexedParticipant


class Participant(ObjectJsonDictifiable):
    """Attachment's attributes, nested within message object."""

    _attrs = {
        'address': str,
        'contact_ids': [uuid.UUID],
        'label': str,
        'protocol': str,
        'type': str
    }

    _model_class = ModelParticipant
    _index_class = IndexedParticipant
