# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from uuid import UUID

from caliopen_main.common.objects.base import ObjectIndexable, \
    ObjectJsonDictifiable
from caliopen_main.pi.objects import PIObject

from ..store.contact import SocialIdentity as ModelSocialIdentity
from ..parameters import SocialIdentity as SocialIdentityParam
from ..store.contact_index import IndexedSocialIdentity


class SocialIdentity(ObjectIndexable):
    """Social identity related to a contact."""

    _attrs = {
        "contact_id": UUID,
        "social_id": UUID,
        "infos": types.DictType,
        "name": types.StringType,
        "type": types.StringType,
        "user_id": UUID
    }

    _json_model = SocialIdentityParam
    _model_class = ModelSocialIdentity
    _index_class = IndexedSocialIdentity


class ContactIdentity(ObjectJsonDictifiable):
    """
    Mean of communication for a contact, with on-demand calculated PI.

    [for ex., a list of ContactIdentity is built for REST API
     …/contact/{contact_id}/identities]

    """

    _attrs = {
        "identifier": types.StringType,
        "label": types.StringType,
        "privacy_index": PIObject,
        "protocol": types.StringType,
    }
