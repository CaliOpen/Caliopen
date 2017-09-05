# -*- coding: utf-8 -*-
"""
Caliopen PI (privacy indexes) definition.

This structure is common to many entities (user, contact, message)
"""
from __future__ import absolute_import, print_function, unicode_literals

from schematics.models import Model
from schematics.types import IntType, DateTimeType


class PIParameter(Model):
    """The privacy indexes schematics parameter definition."""

    technic = IntType()
    comportment = IntType()
    context = IntType()
    version = IntType()
    date_update = DateTimeType()
