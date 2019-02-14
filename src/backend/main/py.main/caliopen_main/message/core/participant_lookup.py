# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

from datetime import datetime

from caliopen_storage.exception import NotFound
from caliopen_main.common.core import BaseUserCore
from ..store.participant import ParticipantLookup as ModelParticipantLookup


class ParticipantLookup(BaseUserCore):
    """Manage participant lookup for discussion consistency."""

    _model_class = ModelParticipantLookup

    @classmethod
    def create(cls, user, identifier, type):
        """Create a new ``ParticipantLookup`` instance."""
        date = datetime.utcnow()
        return super(ParticipantLookup, cls).create(user=user,
                                                    identifier=identifier,
                                                    type=type,
                                                    date_insert=date)

    @classmethod
    def get(cls, user, identifier, type):
        """Retrieve a participant."""
        try:
            model = cls._model_class.get(user_id=user.user_id,
                                         identifier=identifier,
                                         type=type)
            return cls(model)
        except NotFound:
            return None
