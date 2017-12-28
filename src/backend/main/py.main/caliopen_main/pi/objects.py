# -*- coding: utf-8 -*-
"""
Caliopen PI (privacy indexes) definition.

This structure is common to many entities (user, contact, message)
"""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from cassandra.cqlengine import columns
from elasticsearch_dsl import InnerObjectWrapper, Integer, Date

from caliopen_storage.store import BaseUserType
from caliopen_main.common.objects.base import ObjectIndexable


class PIModel(BaseUserType):
    """The privacy indexes model definition."""

    technic = columns.Integer(default=0)
    comportment = columns.Integer(default=0)
    context = columns.Integer(default=0)
    version = columns.Integer(default=0)
    date_update = columns.DateTime()


class PIIndexModel(InnerObjectWrapper):
    """The privacy indexes model definition for index part."""

    comportment = Integer()
    context = Integer()
    date_update = Date()
    technic = Integer()
    version = Integer()


class PIObject(ObjectIndexable):
    """The caliopen object definition of privacy indexes."""

    _attrs = {
        "technic": int,
        "comportment": int,
        "context": int,
        "version": int,
        "user_id": uuid.UUID
    }

    _model_class = PIModel
    _index_class = PIIndexModel
