# -*- coding: utf-8 -*-
"""Caliopen cassandra models related to device."""

from __future__ import absolute_import, print_function, unicode_literals

import logging

from caliopen_storage.store.model import BaseModel, BaseUserType

from cassandra.cqlengine import columns

log = logging.getLogger(__name__)

class LocalIdentity(BaseModel):
    """User local identity, where message are received."""

    display_name = columns.Text()
    identifier = columns.Text(primary_key=True)  # for now,the address of an e-mailbox
    status = columns.Text()  # active, inactive, etc.
    type =columns.Text()  # email, IM, etc.
    user_id = columns.UUID()


class Identity(BaseUserType):
    """Reference to an identity embedded in a messaqe"""

    identifier = columns.Text()
    type = columns.Text()
