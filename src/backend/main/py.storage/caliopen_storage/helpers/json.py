# -*- coding: utf-8 -*-
"""Caliopen helpers related to json data."""

# Strange situation under python 2.x where json do not have JSONENcoder
try:
    import simplejson as json
except ImportError:
    import json

import datetime
from uuid import UUID
from decimal import Decimal


class JSONEncoder(json.JSONEncoder):
    """Specific json encoder to deal with some specific types."""

    _datetypes = (datetime.date, datetime.datetime)

    def default(self, obj):
        """Convert object to JSON encodable type."""
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, self._datetypes):
            return RFC3339Milli(obj)
        if isinstance(obj, UUID):
            return str(obj)
        return super(JSONEncoder, self).default(obj)


def to_json(data):
    """Helper to dump using correct encoder."""
    return json.dumps(data, cls=JSONEncoder)


def RFC3339Milli(value):
    return u"%sZ" % (value.strftime("%Y-%m-%dT%H:%M:%S"))
