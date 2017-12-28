# -*- coding: utf-8 -*-
"""Caliopen User tag parameters classes."""
from __future__ import absolute_import, print_function, unicode_literals
import uuid
import datetime

from caliopen_main.common.objects.base import ObjectUser
from caliopen_main.user.store import UserTag as ModelUSerTag

import logging
log = logging.getLogger(__name__)


class UserTag(ObjectUser):
    """Tag related to an user."""

    _attrs = {
        'date_insert': datetime.datetime,
        'importance_level': int,
        'name': str,
        'tag_id': uuid.UUID,
        'type': str,
        'user_id': uuid.UUID
    }

    _model_class = ModelUSerTag
    _pkey_name = 'tag_id'

    def delete_db(self):
        """Delete a tag in store."""
        self._db.delete()
        return True
