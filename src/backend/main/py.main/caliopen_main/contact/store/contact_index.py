# -*- coding: utf-8 -*-
"""Caliopen contact index classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from elasticsearch_dsl import Mapping, Nested, Text, Keyword, Date, Boolean, \
    InnerObjectWrapper
from caliopen_storage.store.model import BaseIndexDocument
from caliopen_main.pi.objects import PIIndexModel

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
    normalized_number = Text()
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

    user_id = Keyword()
    contact_id = Keyword()

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
    tags = Keyword(multi=True)
    title = Text()

    @property
    def contact_id(self):
        """The compound primary key for a contact is contact_id."""
        return self.meta.id

    @classmethod
    def build_mapping(cls):
        """Create elasticsearch indexed_contacts mapping object for an user."""
        m = Mapping(cls.doc_type)
        m.meta('_all', enabled=True)

        m.field('user_id', 'keyword')
        m.field('contact_id', 'keyword')

        m.field('additional_name', 'text', fields={
            "normalized": {"type": "text", "analyzer": "text_analyzer"}
        })
        # addresses
        addresses = Nested(doc_class=IndexedPostalAddress, include_in_all=True,
                           properties={
                               "address_id": "keyword",
                               "label": "text",
                               "type": "keyword",
                               "is_primary": "boolean",
                               "street": "text",
                               "city": "text",
                               "postal_code": "keyword",
                               "country": "text",
                               "region": "text"
                           })
        m.field("addresses", addresses)
        m.field("avatar", "keyword")
        m.field('date_insert', 'date')
        m.field('date_update', 'date')
        m.field('deleted', 'date')
        # emails
        internet_addr = Nested(doc_class=IndexedInternetAddress,
                               include_in_all=True,
                               )
        internet_addr.field("address", "text", analyzer="text_analyzer",
                            fields={
                                "raw": {"type": "keyword"},
                                "parts": {"type": "text",
                                          "analyzer": "email_analyzer"}
                            })
        internet_addr.field("email_id", Keyword())
        internet_addr.field("is_primary", Boolean())
        internet_addr.field("label", "text", analyzer="text_analyzer")
        internet_addr.field("type", Keyword())
        m.field("emails", internet_addr)

        m.field('family_name', "text", fields={
            "normalized": {"type": "text", "analyzer": "text_analyzer"}
        })
        m.field('given_name', 'text', fields={
            "normalized": {"type": "text", "analyzer": "text_analyzer"}
        })
        m.field("groups", Keyword(multi=True))
        # social ids
        social_ids = Nested(doc_class=IndexedSocialIdentity,
                            include_in_all=True,
                            properties={
                                "name": "text",
                                "type": "keyword",
                                "infos": Nested()
                            })
        m.field("identities", social_ids)
        m.field("ims", internet_addr)
        m.field("infos", Nested())
        m.field('name_prefix', 'keyword')
        m.field('name_suffix', 'keyword')
        # organizations
        organizations = Nested(doc_class=IndexedOrganization,
                               include_in_all=True)
        organizations.field("deleted", Boolean())
        organizations.field("department", "text", analyzer="text_analyzer")
        organizations.field("is_primary", Boolean())
        organizations.field("job_description", "text")
        organizations.field("label", "text", analyzer="text_analyzer")
        organizations.field("name", 'text', fields={
            "normalized": {"type": "text", "analyzer": "text_analyzer"}
        })
        organizations.field("organization_id", Keyword())
        organizations.field("title", Keyword())
        organizations.field("type", Keyword())
        m.field("organizations", organizations)
        # phones
        phones = Nested(doc_class=IndexedPhone, include_in_all=True,
                        properties={
                            "is_primary": "boolean",
                            "number": "text",
                            "normalized_number": "text",
                            "phone_id": "keyword",
                            "type": "keyword",
                            "uri": "keyword"
                        })

        m.field("phones", phones)
        # pi
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
        m.field("tags", Keyword(multi=True))
        m.field('title', 'text', analyzer="text_analyzer",
                fields={
                    "raw": {"type": "keyword"}
                })

        return m
