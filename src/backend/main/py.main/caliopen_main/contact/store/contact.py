# -*- coding: utf-8 -*-
"""Caliopen objects related to contact definition."""
from __future__ import absolute_import, print_function, unicode_literals
import datetime
import pytz
import uuid

from cassandra.cqlengine import columns

from caliopen_storage.store.mixin import IndexedModelMixin
from caliopen_storage.store import BaseModel, BaseUserType
from caliopen_main.pi.objects import PIModel

from .contact_index import IndexedContact
from caliopen_main.common.store.tag import ResourceTag


class Organization(BaseUserType):
    """Contact organizations model."""

    _pkey = 'organization_id'

    deleted = columns.Boolean(default=False)
    department = columns.Text()
    is_primary = columns.Boolean(default=False)
    job_description = columns.Text()
    label = columns.Text()
    name = columns.Text()
    organization_id = columns.UUID(default=uuid.uuid4)
    title = columns.Text()
    type = columns.Text()   # work, other


class PostalAddress(BaseUserType):
    """Contact postal addresses model."""

    _pkey = 'address_id'

    address_id = columns.UUID(default=uuid.uuid4)
    city = columns.Text()
    country = columns.Text()
    is_primary = columns.Boolean(default=False)
    label = columns.Text()
    postal_code = columns.Text()
    region = columns.Text()
    street = columns.Text()
    type = columns.Text()


class Email(BaseUserType):
    """Contact emails model."""

    _pkey = 'email_id'
    uniq_name = 'address'

    address = columns.Text()
    email_id = columns.UUID(default=uuid.uuid4)
    is_primary = columns.Boolean(default=False)
    label = columns.Text()
    type = columns.Text()   # home, work, other


class IM(BaseUserType):
    """Contact instant messaging adresses model."""

    _pkey = 'im_id'
    uniq_name = 'address'

    address = columns.Text()
    im_id = columns.UUID(default=uuid.uuid4)
    is_primary = columns.Boolean(default=False)
    label = columns.Text()
    protocol = columns.Text()
    type = columns.Text()


class Phone(BaseUserType):
    """Contact phones model."""

    _pkey = 'phone_id'
    uniq_name = 'number'

    is_primary = columns.Boolean(default=False)
    number = columns.Text()
    normalized_number = columns.Text()
    phone_id = columns.UUID(default=uuid.uuid4)
    type = columns.Text()
    uri = columns.Text()    # RFC3966


class SocialIdentity(BaseUserType):
    """Any contact social identity (facebook, twitter, linkedin, etc)."""

    _pkey = 'social_id'

    social_id = columns.UUID(default=uuid.uuid4)
    name = columns.Text()
    type = columns.Text()
    # Abstract everything else in a map
    infos = columns.Map(columns.Text, columns.Text)


class Contact(BaseModel, IndexedModelMixin):
    """Contact model."""

    _index_class = IndexedContact

    user_id = columns.UUID(primary_key=True)
    contact_id = columns.UUID(primary_key=True)     # clustering key

    additional_name = columns.Text()
    addresses = columns.List(columns.UserDefinedType(PostalAddress))
    avatar = columns.Text()
    date_insert = columns.DateTime()
    date_update = columns.DateTime()
    deleted = columns.Boolean(default=False)
    emails = columns.List(columns.UserDefinedType(Email))
    family_name = columns.Text()
    given_name = columns.Text()
    groups = columns.List(columns.Text)
    identities = columns.List(columns.UserDefinedType(SocialIdentity))
    ims = columns.List(columns.UserDefinedType(IM))
    infos = columns.Map(columns.Text, columns.Text)
    name_prefix = columns.Text()
    name_suffix = columns.Text()
    organizations = columns.List(columns.UserDefinedType(Organization))
    phones = columns.List(columns.UserDefinedType(Phone))
    pi = columns.UserDefinedType(PIModel)
    privacy_features = columns.Map(columns.Text(), columns.Text())
    tags = columns.List(columns.UserDefinedType(ResourceTag))
    title = columns.Text()  # computed value, read only


class PublicKey(BaseModel):
    """Contact public cryptographic keys model."""

    user_id = columns.UUID(primary_key=True)
    contact_id = columns.UUID(primary_key=True)     # clustering key
    name = columns.Text(primary_key=True)

    date_insert = columns.DateTime(default=datetime.datetime.now(tz=pytz.utc))
    date_update = columns.DateTime()
    type = columns.Text()
    size = columns.Integer()
    key = columns.Text()
    expire_date = columns.DateTime()
    fingerprint = columns.Text()

    privacy_features = columns.Map(columns.Text(), columns.Text())
    pi = PIModel


class ContactLookup(BaseModel):
    """Lookup any information needed to recognize a user contact."""

    user_id = columns.UUID(primary_key=True)
    value = columns.Text(
        primary_key=True)  # address or 'identifier' in identity
    type = columns.Text(primary_key=True)  # email, IM, etc.
    contact_ids = columns.List(columns.UUID())  # many contacts is allowed
