# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid
import logging
from datetime import datetime

from caliopen_storage.exception import NotFound
from caliopen_main.common.core import BaseUserCore
from ..store.participant import ParticipantLookup as ModelParticipantLookup

log = logging.getLogger(__name__)

class ParticipantLookup(BaseUserCore):
    """Manage participant lookup for discussion consistency."""

    _model_class = ModelParticipantLookup

    @classmethod
    def create(cls, user, identifier, kind, part_id=None):
        """Create a new ``ParticipantLookup`` instance."""
        date = datetime.utcnow()
        if not part_id:
            part_id = uuid.uuid4()
        return super(ParticipantLookup, cls).create(user=user,
                                                    identifier=identifier,
                                                    kind=kind,
                                                    participant_id=part_id,
                                                    date_insert=date)

    @classmethod
    def get(cls, user, identifier, kind):
        """Retrieve a participant."""
        try:
            model = cls._model_class.get(user_id=user.user_id,
                                         identifier=str(identifier),
                                         kind=kind)
            return cls(model)
        except NotFound:
            return None

    @classmethod
    def get_or_create(cls, user, identifier, kind, part_id=None):
        """Shortcut to get an existing ``ParticipantLookup`` or create it."""
        obj = cls.get(user, str(identifier), kind)
        if obj is None:
            obj = cls.create(user, str(identifier), kind, part_id)
        return obj
