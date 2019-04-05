# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import logging

from schematics.models import Model
from schematics.types import StringType, UUIDType
from schematics.types.compound import ListType

log = logging.getLogger(__name__)


class Participant(Model):
    address = StringType()
    contact_ids = ListType(UUIDType(), default=lambda: [])
    label = StringType()
    protocol = StringType()
    type = StringType()
    participant_id = UUIDType()

    class Options:
        serialize_when_none = False
