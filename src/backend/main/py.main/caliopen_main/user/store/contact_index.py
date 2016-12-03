# -*- coding: utf-8 -*-
"""Caliopen contact index classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

import elasticsearch_dsl as dsl
from caliopen_storage.store.model import BaseIndexDocument

log = logging.getLogger(__name__)


class IndexedOrganization(dsl.InnerObjectWrapper):

    """Contact indexed organization model."""

    organization_id = dsl.String()
    deleted = dsl.Boolean()
    label = dsl.String()
    department = dsl.String()
    job_description = dsl.String()
    name = dsl.String()
    title = dsl.String()
    is_primary = dsl.Boolean()
    type = dsl.String()


class IndexedPostalAddress(dsl.InnerObjectWrapper):

    """Contact indexed postal addresse model."""

    address_id = dsl.String()
    label = dsl.String()
    type = dsl.String()
    is_primary = dsl.Boolean()
    street = dsl.String()
    city = dsl.String()
    postal_code = dsl.String()
    country = dsl.String()
    region = dsl.String()


class IndexedInternetAddress(dsl.InnerObjectWrapper):

    """Contact indexed address on internet (email, im) model."""

    address = dsl.String()
    label = dsl.String()
    is_primary = dsl.Boolean()
    type = dsl.String()


class IndexedPhone(dsl.InnerObjectWrapper):

    """Contact indexed phone model."""

    number = dsl.String()
    type = dsl.String()
    is_primary = dsl.Boolean()
    uri = dsl.String()


class IndexedSocialIdentity(dsl.InnerObjectWrapper):

    """Contact indexed social identity model."""

    name = dsl.String()
    type = dsl.String()
    # Abstract everything else in a map
    infos = dsl.Nested()


class IndexedContact(BaseIndexDocument):

    """Indexed contact model."""

    doc_type = 'indexed_contacts'

    title = dsl.String()
    given_name = dsl.String()
    additional_name = dsl.String()
    family_name = dsl.String()
    name_suffix = dsl.String()
    name_prefix = dsl.String()
    date_insert = dsl.Date()
    privacy_index = dsl.Integer()

    organizations = dsl.Nested(doc_class=IndexedOrganization)
    addresses = dsl.Nested(doc_class=IndexedPostalAddress)
    emails = dsl.Nested(doc_class=IndexedInternetAddress)
    ims = dsl.Nested(doc_class=IndexedInternetAddress)
    phones = dsl.Nested(doc_class=IndexedPhone)
    social_identities = dsl.Nested(doc_class=IndexedSocialIdentity)

    @property
    def contact_id(self):
        """The compound primary key for a contact is contact_id."""
        return self.meta.id

    @classmethod
    def create_mapping(cls, user_id):
        """Create elasticsearch indexed_contacts mapping object for an user."""
        m = dsl.Mapping(cls.doc_type)
        m.meta('_all', enabled=False)
        m.field('title', dsl.String())
        m.field('given_name', dsl.String(index='not_analyzed'))
        m.field('additional_name', dsl.String(index='not_analyzed'))
        m.field('family_name', dsl.String(index='not_analyzed'))
        m.field('name_suffix', dsl.String(index='not_analyzed'))
        m.field('name_prefix', dsl.String(index='not_analyzed'))
        m.field('date_insert', 'date')
        m.field('privacy_index', 'short')
        # Nested
        m.field('organizations', dsl.Nested(include_in_all=True))
        m.field('addresses', dsl.Nested(include_in_all=True))
        m.field('emails', dsl.Nested(include_in_all=True))
        m.field('ims', dsl.Nested(include_in_all=True))
        m.field('phones', dsl.Nested(include_in_all=True))
        m.field('social_identities', dsl.Nested(include_in_all=True))
        m.save(using=cls.client(), index=user_id)
        return m
