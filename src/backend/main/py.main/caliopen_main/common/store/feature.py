# -*- coding: utf-8 -*-
"""Caliopen privacy_feature objects."""
from __future__ import absolute_import, print_function, unicode_literals

from cassandra.cqlengine import columns
from caliopen_storage.store.model import BaseModel


class PrivacyFeature(BaseModel):
    """Model for a privacy feature."""

    _pkey = 'name'

    name = columns.Text(primary_key=True)
    type = columns.Text(required=True)
    default = columns.Text()

    min = columns.Integer()
    max = columns.Integer()

    apply_to = columns.List(columns.Text())
