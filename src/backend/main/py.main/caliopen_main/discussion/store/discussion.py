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


class DiscussionRecipientLookup(BaseModel):

    """Lookup discussion by a recipient name."""

    # XXX temporary, until a recipients able lookup can be design
    user_id = columns.UUID(primary_key=True)
    recipient_name = columns.Text(primary_key=True)
    discussion_id = columns.UUID()


class DiscussionExternalLookup(BaseModel):

    """Lookup discussion by external_thread_id."""

    user_id = columns.UUID(primary_key=True)
    external_id = columns.Text(primary_key=True)
    discussion_id = columns.UUID()


class DiscussionMessageLookup(BaseModel):

    """Lookup discussion by external message_id."""

    user_id = columns.UUID(primary_key=True)
    external_message_id = columns.Text(primary_key=True)
    discussion_id = columns.UUID()
    message_id = columns.UUID()
