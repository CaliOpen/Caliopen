# -*- coding: utf-8 -*-
"""Caliopen parameters classes.

All input and ouput parameters of core object methods must
use a class that inherit from of of these.
"""
import logging

from .core import BaseCore

log = logging.getLogger(__name__)


class BaseReturnObject(object):

    """Base return object."""

    _return_class = None
    _aliases = {}


class ReturnCoreObject(BaseReturnObject):

    """Return object for core instance.

    to define a return object for a core suitable for protocol
    output, inherit from this class defining _core_class,
    _return_class attribute.

    parameter = ReturnObject.build(core)
    parameter.serialize()
    """

    _core_class = None

    @classmethod
    def _build_sub_core(cls, core):
        """Build return for a core object attached to another."""
        attr = {}
        for col in core._model_class._columns.keys():
            value = getattr(core, col)
            if isinstance(value, (list, tuple)):
                new_value = []
                for val in value:
                    if hasattr(val, 'to_dict'):
                        new_value.append(val.to_dict())
                    else:
                        new_value.append(val)
                value = new_value
            elif hasattr(value, 'to_dict'):
                value = value.to_dict()
            attr.update({col: value})
        return attr

    @classmethod
    def build(cls, core):
        """Main method to build a return object from a core."""
        kls = cls._return_class
        obj = kls()
        for k, v in obj._data.items():
            if cls._aliases.get(k):
                core_key = cls._aliases[k]
            else:
                core_key = k
            attr = getattr(core, core_key)
            if hasattr(cls._core_class, '_relations') \
               and k in cls._core_class._relations:
                # XXX bad design using data key
                if 'data' in attr:
                    attr = attr['data']
                attr = [x.to_dict() for x in attr]
            if isinstance(attr, BaseCore):
                attr = cls._build_sub_core(attr)
            elif isinstance(attr, (list, tuple)):
                new_attr = []
                for val in attr:
                    if hasattr(val, 'to_dict'):
                        value = val.to_dict()
                    else:
                        value = val
                    new_attr.append(value)
                attr = new_attr
            if attr is None and v is not None:
                setattr(obj, k, v)
            else:
                if hasattr(attr, 'to_dict'):
                    setattr(obj, k, attr.to_dict())
                else:
                    setattr(obj, k, attr)
        obj.validate()
        return obj


class ReturnIndexObject(BaseReturnObject):

    """Return object from index entry.

    Inherit from this class for an index class
    and define which parameter return class to use for build

    parameter = ReturnIndexObject(index_entry)
    parameter.serialize()
    """

    _index_class = None
    _default = {}

    @classmethod
    def build(cls, entry):
        """Main method to build a return object from an index entry."""
        kls = cls._return_class
        obj = kls()
        for k, v in obj._data.items():
            if cls._aliases.get(k):
                idx_key = cls._aliases[k]
            else:
                idx_key = k
            attr = entry.get(idx_key, cls._default.get(idx_key))
            setattr(obj, k, attr)
        obj.validate()
        return obj
