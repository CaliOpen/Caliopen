# -*- coding: utf-8 -*-
"""Caliopen message index classes."""
from __future__ import absolute_import, print_function, unicode_literals

import elasticsearch_dsl as dsl
from caliopen_storage.store.model import BaseIndexDocument


class IndexedMessage(BaseIndexDocument):

    """Contact indexed message model."""

    doc_type = 'indexed_message'

    message_id = dsl.String()
    thread_id = dsl.String()
    type = dsl.String()
    from_ = dsl.String()
    date = dsl.Date()
    date_insert = dsl.Date()
    privacy_index = dsl.Integer()
    importance_level = dsl.Integer()
    subject = dsl.String()
    external_message_id = dsl.String()
    external_parent_id = dsl.String()
    external_thread_id = dsl.String()
    tags = dsl.String()
    flags = dsl.String()
    offset = dsl.Integer()
    size = dsl.Integer()

    # XXX better nested definition
    headers = dsl.Nested()
    recipients = dsl.Nested()
    text = dsl.String()

    @property
    def message_id(self):
        """The compound primary key for a message is message_id."""
        return self.meta.id

    @classmethod
    def create_mapping(cls, user_id):
        """Create elasticsearch mapping object for an user."""
        m = dsl.Mapping(cls.doc_type)
        m.meta('_all', enabled=False)
        m.field('message_id', dsl.String(index='not_analyzed'))
        m.field('thread_id', dsl.String(index='not_analyzed'))
        m.field('type', dsl.String(index='not_analyzed'))
        m.field('from_', dsl.String(index='not_analyzed'))
        m.field('date', 'date')
        m.field('date_insert', 'date')
        m.field('privacy_index', 'short')
        m.field('importance_level', 'short')
        m.field('subject', 'string')
        m.field('external_message_id', 'string')
        m.field('external_parent_id', 'string')
        m.field('external_thread_id', 'string')
        m.field('tags', 'string')
        m.field('flags', 'string')
        m.field('offset', 'integer')
        m.field('size', 'integer')
        m.field('text', 'string')
        # Nested
        m.field('recipients', dsl.Nested(include_in_all=True))
        m.field('headers', dsl.Nested(include_in_all=True))
        m.save(using=cls.client(), index=user_id)
        return m
