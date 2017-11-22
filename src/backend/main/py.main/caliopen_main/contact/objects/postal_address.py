# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from caliopen_main.common.objects.base import ObjectIndexable

from ..store.contact import PostalAddress as ModelPostalAddress
from ..returns import PostalAddressParam
from ..store.contact_index import IndexedPostalAddress


class PostalAddress(ObjectIndexable):
    """Postal address related to a contact."""

    _attrs = {
        "address_id": uuid.UUID,
        "city": str,
        "contact_id": uuid.UUID,
        "country": str,
        "is_primary": bool,
        "label": str,
        "postal_code": str,
        "region": str,
        "street": str,
        "type": str,
        "user_id": uuid.UUID
    }

    _model_class = ModelPostalAddress
    _json_model = PostalAddressParam
    _index_class = IndexedPostalAddress
