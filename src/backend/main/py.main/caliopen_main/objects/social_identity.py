# -*- coding: utf-8 -*-
"""Caliopen contact parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.objects import base
from uuid import UUID
from caliopen_main.user.store.contact import SocialIdentity as ModelSocialIdentity
from caliopen_main.user.returns.contact import SocialIdentityParam
from caliopen_main.user.store.contact_index import IndexedSocialIdentity


class SocialIdentity(base.ObjectIndexable):

    _attrs = {
        "contact_id":       UUID,
        "identity_id":      UUID,
        "infos":            {},
        "name":             types.StringType,
        "type":             types.StringType,
        "user_id":          UUID
    }

    _json_model = SocialIdentityParam
    _model_class = ModelSocialIdentity
    _index_class = IndexedSocialIdentity
