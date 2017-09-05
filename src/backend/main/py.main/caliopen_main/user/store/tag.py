# -*- coding: utf-8 -*-
"""Caliopen tag objects."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid
from cassandra.cqlengine import columns

from caliopen_storage.store import BaseModel


class UserTag(BaseModel):
    """User tags model."""

    date_insert = columns.DateTime()
    importance_level = columns.Integer()
    name = columns.Text()
    user_id = columns.UUID(primary_key=True)
    tag_id = columns.UUID(primary_key=True, default=uuid.uuid4)
    type = columns.Text()
