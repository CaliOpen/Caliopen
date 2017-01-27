# -*- coding: utf-8 -*-
"""Caliopen user parameters."""

from schematics.models import Model
from schematics.types import (StringType, UUIDType, IntType,
                              DateTimeType, BooleanType, EmailType)
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
    main_user_id = UUIDType()
    name = StringType(required=True)
    params = DictType(StringType())
    password = StringType(required=True)
    recovery_email = EmailType(required=True)

    class Options:
        serialize_when_none = False


class User(NewUser):

    """Existing user."""

    contact = ModelType(Contact)
    date_insert = DateTimeType(serialized_format="%Y-%m-%dT%H:%M:%S.%f+00:00",
                               tzd=u'utc')
    family_name = StringType()
    given_name = StringType()
    password = StringType()     # not outpout by default, not required
    privacy_features = DictType(StringType, default=lambda: {}, )
    privacy_index = IntType(default=0, )
    user_id = UUIDType(required=True)

    class Options:
        roles = {'default': blacklist('password')}
        serialize_when_none = False


class NewRule(Model):

    """New filter rule."""

    name = StringType(required=True)
    expr = StringType(required=True)
    position = IntType()
    stop_condition = BooleanType(default=False)
    tags = ListType(StringType)

    class Options:
        serialize_when_none = False
