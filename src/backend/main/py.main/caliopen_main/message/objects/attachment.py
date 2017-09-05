# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.common.objects.base import ObjectJsonDictifiable
from ..store.attachment import MessageAttachment as ModelMessageAttachment
from ..store.attachment_index import IndexedMessageAttachment


class MessageAttachment(ObjectJsonDictifiable):

    """attachment's attributes, nested within message object"""

    _attrs = {
        'content_type': types.StringType,
        'file_name': types.SliceType,
        'is_inline': types.BooleanType,
        'size': types.IntType,
        'url': types.StringType,
        'mime_boundary': types.StringType
    }

    _model_class = ModelMessageAttachment
    _index_class = IndexedMessageAttachment
