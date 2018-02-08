# -*- coding: utf-8 -*-
"""Caliopen cassandra base model classes."""
from __future__ import absolute_import, print_function, unicode_literals
import logging

from cassandra.cqlengine.models import Model
from cassandra.cqlengine.query import DoesNotExist
from cassandra.cqlengine.usertype import UserType

from elasticsearch import Elasticsearch
from elasticsearch_dsl import DocType

from ..config import Configuration
from ..exception import NotFound

log = logging.getLogger(__name__)


class BaseModel(Model):
    """Cassandra base model."""

    __abstract__ = True
    __keyspace__ = Configuration('global').get('cassandra.keyspace')
    _index_class = None

    @classmethod
    def create(cls, **kwargs):
        """Create a new model record."""
        attrs = {key: val for key, val in kwargs.items()
                 if key in cls._columns}
        obj = super(BaseModel, cls).create(**attrs)
        if obj._index_class:
            extras = kwargs.get('_indexed_extra', {})
            obj.create_index(**extras)
        return obj

    @classmethod
    def get(cls, **kwargs):
        """Raise our exception when model not found."""
        try:
            return super(BaseModel, cls).get(**kwargs)
        except DoesNotExist as exc:
            raise NotFound(exc)
        except:
            raise

    @classmethod
    def filter(cls, **kwargs):
        """Filter storable objects."""
        return cls.objects.filter(**kwargs)

    @classmethod
    def all(cls):
        """Return all storable objects."""
        return cls.objects.all()


class BaseIndexDocument(DocType):
    """Base class for indexed objects."""

    doc_type = None
    __url__ = Configuration('global').get('elasticsearch.url')

    @classmethod
    def client(cls):
        """Return an elasticsearch client."""
        return Elasticsearch(cls.__url__)

    @classmethod
    def create_mapping(cls, index_name):
        """Create and save elasticsearch mapping for the cls.doc_type."""

        if hasattr(cls, 'build_mapping'):
            log.info('Create index {} mapping for doc_type {}'.
                     format(index_name, cls.doc_type))
            try:
                cls.build_mapping().save(using=cls.client(), index=index_name)
            except Exception as exc:
                log.error("failed to put mapping for {} : {}".
                          format(index_name, exc))
                raise exc


class BaseUserType(UserType):
    """Base class for UserDefined Type in store layer."""

    def to_dict(self):
        return {k: v for k, v in self.items()}
