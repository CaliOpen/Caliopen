# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from uuid import UUID
from caliopen_main.common.objects.base import ObjectJsonDictifiable
from ..store.attachment import MessageAttachment as ModelMessageAttachment
from ..store.attachment_index import IndexedMessageAttachment


class MessageAttachment(ObjectJsonDictifiable):
    """Attachment's attributes, nested within message object."""

    _attrs = {
        'content_type': str,
        'file_name': str,
        'is_inline': bool,
        'size': int,
        'temp_id': UUID,
        'url': str,
        'mime_boundary': str
    }

    _model_class = ModelMessageAttachment
    _index_class = IndexedMessageAttachment
