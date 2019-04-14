# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from cassandra.cqlengine import columns
from caliopen_storage.store import BaseUserType, BaseModel


class HashLookup(BaseModel):
    """
    Table to store two ways links between uris'hash (immutable message's prop.)
    and corresponding current participants'hash

    It is updated each time :
        - a lookup is made on one uris'hash, but this hash does not exist
        - a participant is added/removed from a contact
    """

    user_id = columns.UUID(primary_key=True)
    kind = columns.Text(primary_key=True)  # 'uris' or 'participants'
    key = columns.Text(primary_key=True)  # uris or partcipants' hash
    value = columns.Text(primary_key=True)  # the hash of opposite kind
    components = columns.List(columns.Text())  # what hash is made of
    date_insert = columns.DateTime()
