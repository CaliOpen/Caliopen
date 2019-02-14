# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import uuid
from cassandra.cqlengine import columns

from caliopen_storage.store import BaseUserType, BaseModel


class Participant(BaseUserType):

    """participant nested in message."""

    address = columns.Text()
    contact_ids = columns.List(columns.UUID())
    label = columns.Text()
    protocol = columns.Text()
    type = columns.Text()


class ParticipantLookup(BaseModel):

    """Can lookup a participant per type."""

    user_id = columns.UUID(primary_key=True)
    identifier = columns.Text(primary_key=True)
    type = columns.Text(primary_key=True)
    participant_id = columns.UUID(default=uuid.uuid4)
    date_insert = columns.DateTime()
