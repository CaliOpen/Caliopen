# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import uuid

from caliopen_main.common.objects.base import ObjectIndexable
from ..store.contact import Organization as ModelOrganization
from ..store.contact_index import IndexedOrganization
from ..returns import OrganizationParam


class Organization(ObjectIndexable):

    _attrs = {
        "department":               str,
        "is_primary":               bool,
        "job_description":          str,
        "label":                    str,
        "name":                     str,
        "title":                    str,
        "type":                     str,
        "contact_id":               uuid.UUID,
        "deleted":                  bool,
        "organization_id":          uuid.UUID,
        "user_id":                  uuid.UUID
    }

    _model_class = ModelOrganization
    _json_model = OrganizationParam
    _index_class = IndexedOrganization
