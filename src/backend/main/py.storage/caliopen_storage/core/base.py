# -*- coding: utf-8 -*-
"""
Caliop core base class.

Core are glue code to the storage layer.
"""

from __future__ import absolute_import, print_function, unicode_literals
from six import add_metaclass
from uuid import UUID
import logging

from ..exception import NotFound
from ..core.registry import core_registry

log = logging.getLogger(__name__)


class CoreMetaClass(type):

    """
    Metaclass for all core.

    For all core classes related to a model, add it to core_registry.
    """

    def __init__(cls, name, bases, namespace):
        super(CoreMetaClass, cls).__init__(name, bases, namespace)
        if cls._model_class:
            table_name = cls._model_class.__name__
            if not core_registry.get(table_name):
                core_registry.update({table_name: cls})


@add_metaclass(CoreMetaClass)
class BaseCore(object):

    """Base class for all core objects."""

    _model_class = None
    _lookup_class = None
    _pkey_name = 'id'

    def __init__(self, model):
        """Initialize a core object with a model."""
        self.model = model

    @classmethod
    def create(cls, **attrs):
        """Create a core object."""
        obj = cls._model_class.create(**attrs)
        return cls(obj)

    @classmethod
    def get(cls, key):
        """Get a core object by key."""
        params = {cls._pkey_name: key}
        obj = cls._model_class.get(**params)
        if obj:
            return cls(obj)
        raise NotFound('%s #%s not found' % (cls._model_class.__name__, key))

    def save(self):
        """Save a core object."""
        return self.model.save()

    def delete(self):
        """Delete a core object."""
        # XXX delete related object (relation, lookup)
        return self.model.delete()

    def __getattr__(self, attr):
        """
        used to proxy model attribute.

        Does not proxy attributed retrieve via a "lookup".
        """
        if attr in self.model._columns.keys():
            value = getattr(self.model, attr)
            if isinstance(value, UUID):
                return str(value)
            return value

    def get_id(self):
        """Return object id defined as its primary key."""
        return getattr(self, self._pkey_name)

    @classmethod
    def find(cls, **kwargs):
        """Find core objects, can only use columns part of primary key."""
        if 'count' in kwargs:
            count = kwargs.pop('count')
        else:
            count = False
        if not kwargs:
            objs = cls._model_class.all()
        else:
            objs = cls._model_class.filter(**kwargs)
        if count:
            return objs.count()
        return [cls(x) for x in objs]

    @classmethod
    def count(cls, **kwargs):
        """Count core objects matching filters."""
        kwargs['count'] = True
        return cls.find(**kwargs)


class BaseUserCore(BaseCore):

    """Used by objects related to only one user (most core)."""

    @classmethod
    def get(cls, user, obj_id):
        """Get a core object belong to user, with model related id."""
        param = {cls._pkey_name: obj_id}
        obj = cls._model_class.get(user_id=user.user_id, **param)
        if obj:
            return cls(obj)
        raise NotFound('%s #%s not found for user %s' %
                       (cls.__class__.name, obj_id, user.user_id))

    @classmethod
    def find(cls, user, filters=None, limit=None, offset=0, count=False):
        """
        Find core objects that belong to an user.

        can only use columns part of primary key
        """
        q = cls._model_class.filter(user_id=user.user_id)
        if not filters:
            objs = q
        else:
            objs = q.filter(**filters)
        if count:
            return objs.count()
        if limit or offset:
            objs = objs[offset:(limit+offset)]

        return {'objects': [cls(x) for x in objs], 'total': len(q)}

    @classmethod
    def count(cls, user, filters=None):
        """Count core objects that belong to an user."""
        return cls.find(user, filters, count=True)

    @classmethod
    def create(cls, user, **attrs):
        """Create a core object belong to an user."""
        obj = cls._model_class.create(user_id=user.user_id, **attrs)
        return cls(obj)
