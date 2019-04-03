# -*- coding: utf-8 -*-
"""Caliopen storage model for messages."""
from __future__ import absolute_import, print_function, unicode_literals

from cassandra.cqlengine import columns
from caliopen_storage.store.model import BaseModel


class Discussion(BaseModel):
    """Discussion to group messages model."""

    # XXX threading simplest model, most data are only in index
    user_id = columns.UUID(primary_key=True)
    discussion_id = columns.UUID(primary_key=True)
    date_insert = columns.DateTime()
    # privacy_index = columns.Integer()
    importance_level = columns.Integer()
    excerpt = columns.Text()


class DiscussionListLookup(BaseModel):
    """Lookup discussion by external list-id."""

    user_id = columns.UUID(primary_key=True)
    list_id = columns.Text(primary_key=True)
    discussion_id = columns.UUID()


class DiscussionThreadLookup(BaseModel):
    """Lookup discussion by external thread's root message_id."""

    user_id = columns.UUID(primary_key=True)
    external_root_msg_id = columns.Text(primary_key=True)
    discussion_id = columns.UUID()


class DiscussionHashLookup(BaseModel):
    """Lookup discussion by participants' hash"""

    user_id = columns.UUID(primary_key=True)
    hashed = columns.Text(primary_key=True)
    discussion_id = columns.UUID()


class DiscussionParticipantLookup(BaseModel):
    """Lookup discussion by a participant_id"""

    user_id = columns.UUID(primary_key=True)
    participant_id = columns.UUID(primary_key=True)
    discussion_id = columns.UUID(primary_key=True)
