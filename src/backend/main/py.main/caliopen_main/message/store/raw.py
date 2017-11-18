# -*- coding: utf-8 -*-
"""Caliopen storage model for messages."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from cassandra.cqlengine import columns

from caliopen_storage.store.model import BaseModel


class RawMessage(BaseModel):
    """Raw message model."""

    raw_msg_id = columns.UUID(primary_key=True, default=uuid.uuid4)
    raw_data = columns.Bytes()  # may be empty if data is too large to fit into cassandra
    raw_size = columns.Integer()  # number of bytes in 'data' column
    uri = columns.Text()  # where object is stored if it was too large to fit into raw_data column
    internal_date = columns.DateTime()
    server = columns.Text()
    protocol = columns.Text()
    version_tls = columns.Text()
    cipher_suite = columns.Text()


class UserRawLookup(BaseModel):
    """User's raw message pointer."""

    user_id = columns.UUID(primary_key=True)
    raw_msg_id = columns.UUID(primary_key=True)
