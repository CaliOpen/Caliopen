# -*- coding: utf-8 -*-
"""Caliopen user parameters."""

from schematics.models import Model
from schematics.types import (StringType, UUIDType, IntType,
                              DateTimeType, BooleanType, EmailType)
from schematics.types.compound import ModelType, DictType, ListType
from schematics.transforms import blacklist

from caliopen_main.contact.parameters import NewContact, Contact

from caliopen_main.pi.parameters import PIParameter
import caliopen_storage.helpers.json as helpers


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
    date_insert = DateTimeType(serialized_format=helpers.RFC3339Milli,
                               tzd=u'utc')
    family_name = StringType()
    given_name = StringType()
    password = StringType()     # not outpout by default, not required
    privacy_features = DictType(StringType, default=lambda: {}, )
    pi = ModelType(PIParameter)
    user_id = UUIDType()

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
