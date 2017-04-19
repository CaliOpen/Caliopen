# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.objects import base

import uuid
from uuid import UUID
import datetime
import json

from caliopen_main.message.store import Message as ModelMessage
from caliopen_main.message.store import IndexedMessage
from caliopen_main.message.parameters.message import Message as ParamMessage
from caliopen_main.message.parameters.draft import Draft
from caliopen_main.message.core import RawMessage
from .tag import ResourceTag
from .attachment import MessageAttachment
from .external_references import ExternalReferences
from .identities import Identity
from .participant import Participant
from .privacy_features import PrivacyFeatures
import caliopen_main.errors as err

import logging

log = logging.getLogger(__name__)


class Message(base.ObjectIndexable):
    """Message object class."""

    # TODO : manage attrs that should not be editable directly by users
    _attrs = {
        'attachments': [MessageAttachment],
        'body': types.StringType,
        'date': datetime.datetime,
        'date_delete': datetime.datetime,
        'date_insert': datetime.datetime,
        'discussion_id': UUID,
        'external_references': ExternalReferences,
        'identities': [Identity],
        'importance_level': types.IntType,
        'is_answered': types.BooleanType,
        'is_draft': types.BooleanType,
        'is_unread': types.BooleanType,
        'message_id': UUID,
        'parent_id': types.StringType,
        'participants': [Participant],
        'privacy_features': PrivacyFeatures,
        'raw_msg_id': UUID,
        'subject': types.StringType,
        'tags': [ResourceTag],
        'type': types.StringType,
        'user_id': UUID,
    }

    _json_model = ParamMessage

    # operations related to cassandra
    _model_class = ModelMessage
    _db = None  # model instance with datas from db
    _pkey_name = "message_id"

    #  operations related to elasticsearch
    _index_class = IndexedMessage
    _index = None

    @property
    def raw(self):
        """Return raw text from pristine raw message."""
        msg = RawMessage.get_for_user(self.user_id, self.raw_msg_id)
        return msg.raw_data

    @property
    def raw_json(self):
        """Return json representation of pristine raw message."""
        msg = RawMessage.get_for_user(self.user_id, self.raw_msg_id)
        return json.loads(msg.json_rep)

    @classmethod
    def create_draft(cls, user_id=None, **params):
        """
        Create and save a new message (draft) for an user.

        :params: a NewMessage dict
        """

        if user_id is None or user_id is "":
            raise ValueError

        try:
            draft_param = Draft(params)
            draft_param.validate_consistency(user_id, True)
        except Exception as exc:
            log.warn(exc)
            raise exc

        message = Message()
        message.unmarshall_json_dict(draft_param)
        message.user_id = UUID(user_id)
        message.message_id = uuid.uuid4()
        message.is_draft = True
        message.type = "email"  # TODO: type handling inferred from participants
        message.date_insert = datetime.datetime.utcnow()

        try:
            message.marshall_db()
            message.save_db()
        except Exception as exc:
            log.warn(exc)
            raise exc
        try:
            message.marshall_index()
            message.save_index()
        except Exception as exc:
            log.warn(exc)
            raise exc
        return message

    def patch_draft(self, patch, **options):
        """operations specific to draft, before applying generic patch method"""

        self.get_db()
        self.unmarshall_db()
        if not self.is_draft:
            return err.PatchUnprocessable(message="this message is not a draft")

        try:
            params = dict(patch)
            params.pop("current_state")
            draft_param = Draft(params)
            draft_param.validate_consistency(self.user_id, False)
        except Exception as exc:
            log.warn(exc)
            return err.PatchError(message=exc.message)

        self.apply_patch(patch, **options)

    @classmethod
    def by_discussion_id(cls, user, discussion_id, min_pi, max_pi,
                         order=None, limit=None, offset=0):
        """Get messages for a given discussion from index."""
        res = cls._model_class.search(user, discussion_id=discussion_id,
                                      min_pi=min_pi, max_pi=max_pi,
                                      limit=limit,
                                      offset=offset)
        messages = []
        if res.hits:
            for x in res.hits:
                obj = cls(user.user_id, message_id=x.meta.id)
                obj.get_db()
                obj.unmarshall_db()
                messages.append(obj)
        return {'hits': messages, 'total': res.hits.total}
