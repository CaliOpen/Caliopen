# -*- coding: utf-8 -*-
"""Caliopen storage model for messages."""
from __future__ import absolute_import, print_function, unicode_literals

from cassandra.cqlengine import columns
from caliopen_storage.store.model import BaseModel


# TODO : make user of ParticipantLookup table
class DiscussionListLookup(BaseModel):
    """Lookup discussion by external list-id."""

    user_id = columns.UUID(primary_key=True)
    list_id = columns.Text(primary_key=True)
    discussion_id = columns.UUID()  # TODO : primary ?


class DiscussionThreadLookup(BaseModel):
    """Lookup discussion by external thread's root message_id."""

    user_id = columns.UUID(primary_key=True)
    external_root_msg_id = columns.Text(primary_key=True)
    discussion_id = columns.UUID()


class DiscussionLookup(BaseModel):
    user_id = columns.UUID(primary_key=True)
    key = columns.Text(primary_key=True)
    value = columns.Text(primary_key=True)
    date_insert = columns.DateTime()
