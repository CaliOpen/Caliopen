# -*- coding: utf-8 -*-
"""Caliopen core raw message class."""
from __future__ import absolute_import, print_function, unicode_literals

import hashlib
import logging

from caliopen_storage.core import BaseUserCore
from caliopen_storage.exception import NotFound

from ..store import RawMessage as ModelRaw
from ..format import MailMessage

log = logging.getLogger(__name__)

class RawMessage(BaseUserCore):

    """
    Raw message core.

    Store in binary form any message before processing
    """

    _model_class = ModelRaw
    _pkey_name = 'raw_id'

    @classmethod
    def create(cls, user, message_id, raw):
        """Create raw message."""
        key = hashlib.sha256(message_id).hexdigest()
        return super(RawMessage, cls).create(user, raw_id=key, data=raw)

    @classmethod
    def get(cls, user, message_id):
        """Get raw message by raw_message_id."""
        try:
            return super(RawMessage, cls).get(user, message_id)
        except NotFound:
            return None


    def parse(self):
        """Parse raw message to get a formatted object."""
        return MailMessage(self.data)
