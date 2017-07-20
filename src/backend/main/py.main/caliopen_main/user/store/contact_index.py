# -*- coding: utf-8 -*-
"""Caliopen contact index classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from elasticsearch_dsl import Mapping, Nested, Text, Keyword, Date, Boolean, \
    InnerObjectWrapper, Integer
from caliopen_storage.store.model import BaseIndexDocument
from caliopen_main.objects.pi import PIIndexModel

from .tag_index import IndexedResourceTag


log = logging.getLogger(__name__)


class IndexedOrganization(InnerObjectWrapper):

    """Contact indexed organization model."""

    organization_id = Keyword()
    deleted = Boolean()
    label = Text()
    department = Text()
    job_description = Text()
    name = Keyword()
    title = Keyword()
    is_primary = Boolean()
    type = Keyword()


class IndexedPostalAddress(InnerObjectWrapper):

    """Contact indexed postal addresse model."""

    address_id = Keyword()
    label = Text()
    type = Keyword()
    is_primary = Boolean()
    street = Text()
    city = Text()
    postal_code = Text()
    country = Text()
    region = Text()


class IndexedInternetAddress(InnerObjectWrapper):

    """Contact indexed address on internet (email, im) model."""

    address = Keyword()
    label = Text()
    is_primary = Boolean()
    type = Keyword()


class IndexedPhone(InnerObjectWrapper):

    """Contact indexed phone model."""

    number = Text()
    type = Keyword()
    is_primary = Boolean()
    uri = Keyword()


class IndexedSocialIdentity(InnerObjectWrapper):

    """Contact indexed social identity model."""

    name = Text()
    type = Keyword()
    # Abstract everything else in a map
    infos = Nested()


class IndexedContact(BaseIndexDocument):

    """Indexed contact model."""

    doc_type = 'indexed_contact'

    title = Text()
    given_name = Keyword()
    additional_name = Keyword()
    family_name = Keyword()
    name_suffix = Keyword()
    name_prefix = Keyword()
    date_insert = Date()
    privacy_index = Integer()

    organizations = Nested(doc_class=IndexedOrganization)
    addresses = Nested(doc_class=IndexedPostalAddress)
    emails = Nested(doc_class=IndexedInternetAddress)
    ims = Nested(doc_class=IndexedInternetAddress)
    phones = Nested(doc_class=IndexedPhone)
    social_identities = Nested(doc_class=IndexedSocialIdentity)
    tags = Nested(doc_class=IndexedResourceTag)

    pi = Nested(doc_class=PIIndexModel)
    privacy_features = Nested()

    @property
    def contact_id(self):
        """The compound primary key for a contact is contact_id."""
        return self.meta.id

    @classmethod
    def create_mapping(cls, user_id):
        """Create elasticsearch indexed_contacts mapping object for an user."""

        m = Mapping(cls.doc_type)
        m.meta('_all', enabled=True)
        m.field('title', 'text')
        m.field('given_name', 'keyword')
        m.field('additional_name', 'keyword')
        m.field('family_name', 'keyword')
        m.field('name_suffix', 'keyword')
        m.field('name_prefix', 'keyword')
        m.field('date_insert', 'date')
        m.field('privacy_index', 'short')
        organizations = Nested(doc_class=IndexedOrganization,
                               include_in_all=True,
                               properties={
                                   "organization_id": "keyword",
                                   "deleted": "boolean",
                                   "label": "text",
                                   "department": "text",
                                   "job_description": "text",
                                   "name": "keyword",
                                   "title": "keyword",
                                   "is_primary": "boolean",
                                   "type": "keyword"
                               })
        m.field("organizations", organizations)
        addresses = Nested(doc_class=IndexedPostalAddress, include_in_all=True,
                           properties={
                               "address_id": "keyword",
                               "label": "tetx",
                               "type": "keyword",
                               "is_primary": "boolean",
                               "street": "text",
                               "city": "text",
                               "postal_code": "text",
                               "country": "text",
                               "region": "text"
                           })
        m.field("addresses", addresses)
        internet_add = Nested(doc_class=IndexedInternetAddress,
                              include_in_all=True,
                              properties={
                                  "address": 'keyword',
                                  "label": 'text',
                                  "is_primary": "boolean",
                                  "type": 'keyword'
                        })
        m.field("emails", internet_add)
        m.field("ims", internet_add)
        phones = Nested(doc_class=IndexedPhone, include_in_all=True,
                        properties={
                            "number": "text",
                            "type": "keyword",
                            "is_primary": "boolean",
                            "uri": "keyword"
                        })
        m.field("phones", phones)
        social_ids = Nested(doc_class=IndexedSocialIdentity,
                            include_in_all=True,
                            properties={
                                "name": "text",
                                "type": "keyword",
                                "infos": Nested()
                            })
        m.field("social_identities", social_ids)
        tags = Nested(doc_class=IndexedResourceTag, include_in_all=True,
                      properties={
                          "date_insert": "date",
                          "importance_level": "integer",
                          "label": "text",
                          "name": "keyword",
                          "tag_id": "keyword",
                          "type": "boolean"
                      })
        m.field("tags", tags)
        pi = Nested(doc_class=PIIndexModel, include_in_all=True,
                    properties={
                        "technic": "integer",
                        "comportment": "integer",
                        "context": "integer",
                        "version": "integer"
                    })
        m.field("pi", pi)
        m.field("privacy_features", Nested())
        m.save(using=cls.client(), index=user_id)
        return m
