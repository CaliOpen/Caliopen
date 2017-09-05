# -*- coding: utf-8 -*-
"""Caliopen contact index classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from elasticsearch_dsl import Mapping, Nested, Text, Keyword, Date, Boolean, \
    InnerObjectWrapper
from caliopen_storage.store.model import BaseIndexDocument
from caliopen_main.pi.objects import PIIndexModel

from caliopen_main.common.store.tag import IndexedResourceTag

log = logging.getLogger(__name__)


class IndexedOrganization(InnerObjectWrapper):
    """Contact indexed organization model."""

    deleted = Boolean()
    department = Text()
    is_primary = Boolean()
    job_description = Text()
    label = Text()
    name = Keyword()
    organization_id = Keyword()
    title = Keyword()
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
    email_id = Keyword()
    is_primary = Boolean()
    label = Text()
    type = Keyword()


class IndexedPhone(InnerObjectWrapper):
    """Contact indexed phone model."""

    is_primary = Boolean()
    number = Text()
    phone_id = Keyword()
    type = Keyword()
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

    additional_name = Keyword()
    addresses = Nested(doc_class=IndexedPostalAddress)
    avatar = Keyword()
    date_insert = Date()
    date_update = Date()
    deleted = Date()
    emails = Nested(doc_class=IndexedInternetAddress)
    family_name = Keyword()
    given_name = Keyword()
    groups = Keyword(multi=True)
    identities = Nested(doc_class=IndexedSocialIdentity)
    ims = Nested(doc_class=IndexedInternetAddress)
    infos = Nested()
    name_prefix = Keyword()
    name_suffix = Keyword()
    organizations = Nested(doc_class=IndexedOrganization)
    phones = Nested(doc_class=IndexedPhone)
    pi = Nested(doc_class=PIIndexModel)
    privacy_features = Nested()
    public_key = Nested()
    social_identities = Nested(doc_class=IndexedSocialIdentity)
    tags = Nested(doc_class=IndexedResourceTag)
    title = Text()

    @property
    def contact_id(self):
        """The compound primary key for a contact is contact_id."""
        return self.meta.id

    @classmethod
    def create_mapping(cls, user_id):
        """Create elasticsearch indexed_contacts mapping object for an user."""
        m = Mapping(cls.doc_type)
        m.meta('_all', enabled=True)
        m.field('additional_name', 'keyword')
        addresses = Nested(doc_class=IndexedPostalAddress, include_in_all=True,
                           properties={
                               "address_id": "keyword",
                               "label": "text",
                               "type": "keyword",
                               "is_primary": "boolean",
                               "street": "text",
                               "city": "text",
                               "postal_code": "text",
                               "country": "text",
                               "region": "text"
                           })
        m.field("addresses", addresses)
        m.field("avatar", "keyword")
        m.field('date_insert', 'date')
        m.field('date_update', 'date')
        m.field('deleted', 'date')
        internet_add = Nested(doc_class=IndexedInternetAddress,
                              include_in_all=True,
                              properties={
                                  "address": 'keyword',
                                  "email_id": "keyword",
                                  "is_primary": "boolean",
                                  "label": 'text',
                                  "type": 'keyword'
                              })
        m.field("emails", internet_add)
        m.field('family_name', 'keyword')
        m.field('given_name', 'keyword')
        m.field("groups", Keyword(multi=True))
        social_ids = Nested(doc_class=IndexedSocialIdentity,
                            include_in_all=True,
                            properties={
                                "name": "text",
                                "type": "keyword",
                                "infos": Nested()
                            })
        m.field("identities", social_ids)
        m.field("ims", internet_add)
        m.field("infos", Nested())
        m.field('name_prefix', 'keyword')
        m.field('name_suffix', 'keyword')
        organizations = Nested(doc_class=IndexedOrganization,
                               include_in_all=True,
                               properties={
                                   "deleted": "boolean",
                                   "department": "text",
                                   "is_primary": "boolean",
                                   "job_description": "text",
                                   "label": "text",
                                   "name": "keyword",
                                   "organization_id": "keyword",
                                   "title": "keyword",
                                   "type": "keyword"
                               })
        m.field("organizations", organizations)
        phones = Nested(doc_class=IndexedPhone, include_in_all=True,
                        properties={
                            "is_primary": "boolean",
                            "number": "text",
                            "phone_id": "keyword",
                            "type": "keyword",
                            "uri": "keyword"
                        })
        m.field("phones", phones)
        pi = Nested(doc_class=PIIndexModel, include_in_all=True,
                    properties={
                        "comportment": "integer",
                        "context": "integer",
                        "date_update": "date",
                        "technic": "integer",
                        "version": "integer"
                    })
        m.field("pi", pi)
        m.field("privacy_features", Nested(include_in_all=True))
        m.field("public_key", Nested())
        m.field("social_identities", social_ids)
        tags = Nested(doc_class=IndexedResourceTag, include_in_all=True,
                      properties={
                          "date_insert": "date",
                          "importance_level": "integer",
                          "name": "keyword",
                          "tag_id": "keyword",
                          "type": "boolean"
                      })
        m.field("tags", tags)
        m.field('title', 'text')

        m.save(using=cls.client(), index=user_id)
        return m
