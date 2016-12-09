# -*- coding: utf-8 -*-
"""Caliopen user parameters."""

from schematics.models import Model
from schematics.types import (StringType, UUIDType, IntType,
                              DateTimeType, BooleanType)
from schematics.types.compound import ModelType, DictType, ListType
from schematics.transforms import blacklist

from .contact import NewContact, Contact


class NewUser(Model):

    """
    Parameter to create a new user.

    only name and password are required
    a ``NewContact`` can be attached when creating user
    """

    contact = ModelType(NewContact)
    main_user_id = UUIDType(serialize_when_none=False)
    name = StringType(required=True)
    params = DictType(StringType(serialize_when_none=False))
    password = StringType(required=True)


class User(NewUser):

    """Existing user."""

    contact = ModelType(Contact)
    date_insert = DateTimeType(serialize_when_none=True)
    family_name = StringType(serialize_when_none=False)
    given_name = StringType(serialize_when_none=False)
    password = StringType(serialize_when_none=False)     # not outpout by default, not required
    privacy_features = DictType(StringType, default=lambda: {}, serialize_when_none=False)
    privacy_index = IntType(default=0, serialize_when_none=False)
    user_id = UUIDType(required=True)

    class Options:
        roles = {'default': blacklist('password')}


class Tag(Model):

    """Existing user tag."""

    user_id = UUIDType(serialize_when_none=False)
    label = StringType(serialize_when_none=False)
    background = StringType(serialize_when_none=False)
    color = StringType(serialize_when_none=False)

    class Option:
        roles = {'default': blacklist('user_id')}


class NewRule(Model):

    """New filter rule."""

    name = StringType(required=True)
    expr = StringType(required=True)
    position = IntType(serialize_when_none=False)
    stop_condition = BooleanType(default=False, serialize_when_none=False)
    tags = ListType(StringType, serialize_when_none=False)
