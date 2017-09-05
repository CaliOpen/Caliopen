# -*- coding: utf-8 -*-
"""Caliopen storage interfaces definitions."""
from __future__ import absolute_import, print_function, unicode_literals

import zope.interface


class DbIO(zope.interface.Interface):
    """Interface for objects persisted in cassandra"""

    def get_db(**options):
        """Retreive object from db and place it in a _model_class instance"""
        raise NotImplementedError

    def save_db(**options):
        """"""
        raise NotImplementedError

    def create_db(**options):
        """"""
        raise NotImplementedError

    def delete_db(**options):
        """"""
        raise NotImplementedError

    def update_db(**options):
        """Update values within _model_class from object values and save them"""
        raise NotImplementedError

    def marshall_db(**options):
        """Create a _model_class instance with current object attributes

        For now, we rely on cassandra's Encoder.
        We could customize this marshaller in future if needed
        """
        raise NotImplementedError

    def unmarshall_db(**options):
        """Fill object attributes with values from _db"""
        raise NotImplementedError


class IndexIO(zope.interface.Interface):
    """Interface for objects indexed in Elasticsearch"""

    def marshall_index(**options):
        """Create a _index_class instance with current object attributes"""
        raise NotImplementedError

    def unmarshall_index(**options):
        """Fill object's attributes with values from _index"""
        raise NotImplementedError
