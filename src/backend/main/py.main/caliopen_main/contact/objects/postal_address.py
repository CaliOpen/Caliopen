# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.common.objects.base import ObjectIndexable
from uuid import UUID
from ..store.contact import PostalAddress as ModelPostalAddress
from ..returns import PostalAddressParam
from ..store.contact_index import IndexedPostalAddress


class PostalAddress(ObjectIndexable):

    _attrs = {
        "address_id":               UUID,
        "city":                     types.StringType,
        "contact_id":               UUID,
        "country":                  types.StringType,
        "is_primary":               types.BooleanType,
        "label":                    types.StringType,
        "postal_code":              types.StringType,
        "region":                   types.StringType,
        "street":                   types.StringType,
        "type":                     types.StringType,
        "user_id":                  UUID
    }

    _model_class = ModelPostalAddress
    _json_model = PostalAddressParam
    _index_class = IndexedPostalAddress
