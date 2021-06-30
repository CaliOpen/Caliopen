# -*- coding: utf-8 -*-
"""Caliopen message object classes."""

from uuid import UUID

from caliopen_main.common.objects.base import ObjectJsonDictifiable
from caliopen_main.participant.store.participant import \
    Participant as ModelParticipant
from caliopen_main.participant.store.participant_index import IndexedParticipant


class Participant(ObjectJsonDictifiable):
    """participant's attributes, nested within message object"""

    _attrs = {
        'address': str,
        'contact_ids': [UUID],
        'label': str,
        'participant_id': UUID,
        'protocol': str,
        'type': str
    }

    _model_class = ModelParticipant
    _index_class = IndexedParticipant
