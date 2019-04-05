# -*- coding: utf-8 -*-
"""Caliopen message index classes."""
from __future__ import absolute_import, print_function, unicode_literals

from elasticsearch_dsl import Mapping, Nested, Text, Keyword, Date, Boolean, \
    Integer, Object
from caliopen_storage.store.model import BaseIndexDocument

from .attachment_index import IndexedMessageAttachment
from .external_references_index import IndexedExternalReferences
from caliopen_main.pi.objects import PIIndexModel
from caliopen_main.participant.store.participant_index import IndexedParticipant


class IndexedMessage(BaseIndexDocument):
    """Contact indexed message model."""

    doc_type = 'indexed_message'

    user_id = Keyword()
    message_id = Keyword()

    attachments = Nested(doc_class=IndexedMessageAttachment)
    body_html = Text()
    body_plain = Text()
    date = Date()
    date_delete = Date()
    date_insert = Date()
    date_sort = Date()
    discussion_id = Keyword()
    external_references = Nested(doc_class=IndexedExternalReferences)
    importance_level = Integer()
    is_answered = Boolean()
    is_draft = Boolean()
    is_unread = Boolean()
    is_received = Boolean()
    parent_id = Keyword()
    participants = Nested(doc_class=IndexedParticipant)
    participants_hash = Keyword()
    privacy_features = Object()
    pi = Object(doc_class=PIIndexModel)
    raw_msg_id = Keyword()
    subject = Text()
    tags = Keyword(multi=True)
    protocol = Keyword()
    user_identities = Keyword(multi=True)

    @property
    def message_id(self):
        """The compound primary key for a message is message_id."""
        return self.meta.id

    @classmethod
    def build_mapping(cls):
        """Generate the mapping definition for indexed messages"""
        m = Mapping(cls.doc_type)
        m.meta('_all', enabled=True)
        m.field('user_id', 'keyword')
        # attachments
        m.field('attachments', Nested(doc_class=IndexedMessageAttachment,
                                      include_in_all=True,
                                      properties={
                                          "content_type": Keyword(),
                                          "file_name": Keyword(),
                                          "is_inline": Boolean(),
                                          "size": Integer(),
                                          "temp_id": Keyword(),
                                          "url": Keyword(),
                                          "mime_boundary": Keyword()
                                      })
                )
        m.field('body_html', 'text', fields={
            "normalized": {"type": "text", "analyzer": "text_analyzer"}
        })
        m.field('body_plain', 'text', fields={
            "normalized": {"type": "text", "analyzer": "text_analyzer"}
        })
        m.field('date', 'date')
        m.field('date_delete', 'date')
        m.field('date_insert', 'date')
        m.field('date_sort', 'date')
        m.field('discussion_id', 'keyword')
        # external references
        m.field('external_references',
                Nested(doc_class=IndexedExternalReferences,
                       include_in_all=True,
                       properties={
                           "ancestors_ids": Keyword(),
                           "message_id": Keyword(),
                           "parent_id": Keyword()
                       })
                )
        m.field('importance_level', 'short')
        m.field('is_answered', 'boolean')
        m.field('is_draft', 'boolean')
        m.field('is_unread', 'boolean')
        m.field('is_received', 'boolean')
        m.field('message_id', 'keyword')
        m.field('parent_id', 'keyword')
        # participants
        participants = Nested(doc_class=IndexedParticipant,
                              include_in_all=True)
        participants.field("address", "text", analyzer="text_analyzer",
                           fields={
                               "raw": {"type": "keyword"},
                               "parts": {"type": "text",
                                         "analyzer": "email_analyzer"}
                           })
        participants.field("contact_ids", Keyword(multi=True))
        participants.field("label", "text", analyzer="text_analyzer")
        participants.field("protocol", Keyword())
        participants.field("type", Keyword())
        m.field('participants', participants)
        m.field('participants_hash', 'keyword')
        # PI
        pi = Object(doc_class=PIIndexModel, include_in_all=True,
                    properties={
                        "technic": "integer",
                        "comportment": "integer",
                        "context": "integer",
                        "version": "integer",
                        "date_update": "date"
                    })
        m.field("pi", pi)
        m.field('privacy_features', Object(include_in_all=True))
        m.field('raw_msg_id', "keyword")
        m.field('subject', 'text', fields={
            "normalized": {"type": "text", "analyzer": "text_analyzer"}
        })
        m.field('tags', Keyword(multi=True))

        m.field('subject', 'text')
        m.field('tags', Keyword(multi=True))
        m.field('protocol', 'keyword')
        m.field('user_identities', Keyword(multi=True))

        return m
