# -*- coding: utf-8 -*-
"""Caliopen IO interfaces definitions."""
from __future__ import absolute_import, print_function, unicode_literals

import zope.interface

"""
marshall functions transform a core object to something expected by counterpart
unMarshall func transform something coming from counterpart to a core object
"""


class JsonDictIO(zope.interface.Interface):
    """json dict is a dict ready to be serialized into a json

    ie : attr values are only str, int, bool or None
    """

    def marshall_json_dict(**options):
        raise NotImplementedError

    def unmarshall_json_dict(**options):
        raise NotImplementedError


class ProtobufIO(zope.interface.Interface):
    """IO between caliopen's objects and protobuf objects"""

    def marshall_protobuf(**options):
        raise NotImplementedError

    def unmarshall_protobuf(message, **options):
        raise NotImplementedError


class DictIO(zope.interface.Interface):
    def marshall_dict(**options):
        raise NotImplementedError

    def unmarshall_dict(document, **options):
        raise NotImplementedError


class JsonIO(zope.interface.Interface):
    """json is an array of bytes"""

    def marshall_json(**options):
        raise NotImplementedError

    def unmarshall_json(document, **options):
        raise NotImplementedError



