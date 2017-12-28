# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

from caliopen_main.common.objects.base import ObjectIndexable

import uuid
import datetime
import pytz
import json
import copy

from caliopen_storage.exception import NotFound
from caliopen_main.pi.objects import PIObject
from caliopen_main.common.objects.tag import ResourceTag

from ..store import Message as ModelMessage
from ..store import IndexedMessage
from ..parameters.message import Message as ParamMessage
from ..parameters.draft import Draft
from ..core import RawMessage
from .attachment import MessageAttachment
from .external_references import ExternalReferences
from caliopen_main.user.objects.identities import Identity
from .participant import Participant
from schematics.types import UUIDType
from caliopen_main.message.parameters.participant import \
    Participant as IndexedParticipant
from caliopen_main.common import errors as err

import logging

log = logging.getLogger(__name__)


class Message(ObjectIndexable):
    """Message object class."""

    # TODO : manage attrs that should not be editable directly by users
    _attrs = {
        'attachments': [MessageAttachment],
        'body_html': str,
        'body_plain': str,
        'date': datetime.datetime,
        'date_delete': datetime.datetime,
        'date_insert': datetime.datetime,
        'discussion_id': uuid.UUID,
        'external_references': ExternalReferences,
        'identities': [Identity],
        'importance_level': int,
        'is_answered': bool,
        'is_draft': bool,
        'is_unread': bool,
        'is_received': bool,
        'message_id': uuid.UUID,
        'parent_id': uuid.UUID,
        'participants': [Participant],
        'privacy_features': dict,
        'pi': PIObject,
        'raw_msg_id': uuid.UUID,
        'subject': str,
        'tags': [ResourceTag],
        'type': str,
        'user_id': uuid.UUID,
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
            if draft_param.message_id:
                draft_param.validate_uuid(user_id)
            else:
                draft_param.message_id = uuid.uuid4()
            draft_param.validate_consistency(user_id, True)
        except Exception as exc:
            log.warn("draft_param error")
            log.warn(exc)
            raise exc

        message = Message()
        message.unmarshall_json_dict(draft_param.to_primitive())
        message.user_id = uuid.UUID(user_id)
        message.is_draft = True
        message.is_received = False
        message.type = "email"
        message.date_insert = datetime.datetime.now(tz=pytz.utc)

        try:
            message.marshall_db()
            message.save_db()
        except Exception as exc:
            log.warn(exc)
            raise exc
        try:
            message.marshall_index()
            message.save_index(wait_for=True)
        except Exception as exc:
            log.warn(exc)
            raise exc
        return message

    def patch_draft(self, patch, **options):
        """Operation specific to draft, before applying generic patch."""
        try:
            self.get_db()
            self.unmarshall_db()
        except Exception as exc:
            log.info("patch_draft() failed to get msg from db: {}".format(
                exc))
            raise exc

        if not self.is_draft:
            raise err.PatchUnprocessable(message="this message is not a draft")
        try:
            params = dict(patch)
            current_state = params.pop("current_state")
            draft_param = Draft(params)
        except Exception as exc:
            log.info(exc)
            raise err.PatchError(message=exc.message)

        # add missing params to be able to check consistency
        self_dict = self.marshall_dict()
        if "message_id" not in params and self.message_id:
            draft_param.message_id = UUIDType().to_native(self.message_id)

        if "discussion_id" not in params and self.discussion_id:
            draft_param.discussion_id = UUIDType(). \
                to_native(self.discussion_id)

        if "parent_id" not in params and self.parent_id:
            draft_param.parent_id = UUIDType().to_native(self.parent_id)

        if "subject" not in params:
            draft_param.subject = self.subject

        if "participants" not in params and self.participants:
            for participant in self_dict['participants']:
                ps = draft_param.participants
                ps.append(IndexedParticipant(participant))

        if "identities" not in params and self.identities:
            draft_param.identities = self_dict["identities"]

        try:
            draft_param.validate_consistency(str(self.user_id), False)
        except Exception as exc:
            log.info("consistency validation failed with err : {}".format(exc))
            raise err.PatchError(message=exc.message)

        # make sure the <from> participant is present
        # and is consistent with selected user's identity
        validated_draft = draft_param.serialize()
        validated_params = copy.deepcopy(params)
        if "participants" in params:
            validated_params["participants"] = validated_draft["participants"]

        # remove empty UUIDs from current state if any
        if "parent_id" in current_state and current_state["parent_id"] == "":
            del (current_state["parent_id"])
        if "discussion_id" in current_state and current_state[
            "discussion_id"] == "":
            del (current_state["discussion_id"])

        # handle body key mapping to body_plain or body_html
        # TODO: handle plain/html flag to map to right field
        if "body" in validated_params:
            validated_params["body_plain"] = validated_params["body"]
            del (validated_params["body"])
        if "body" in current_state:
            current_state["body_plain"] = current_state["body"]
            del (current_state["body"])

        validated_params["current_state"] = current_state

        try:
            self.apply_patch(validated_params, **options)
        except Exception as exc:
            log.info("apply_patch() failed with error : {}".format(exc))
            raise exc

    @classmethod
    def by_discussion_id(cls, user, discussion_id, min_pi, max_pi,
                         order=None, limit=None, offset=0):
        """Get messages for a given discussion from index."""
        res = cls._model_class.search(user, discussion_id=discussion_id,
                                      min_pi=min_pi, max_pi=max_pi,
                                      limit=limit,
                                      offset=offset,
                                      sort="-date_insert")
        messages = []
        if res.hits:
            for x in res.hits:
                try:
                    obj = cls(user.user_id, message_id=x.meta.id)
                    obj.get_db()
                    obj.unmarshall_db()
                    messages.append(obj)
                except Exception as exc:
                    log.warn(exc)
            return {'hits': messages, 'total': res.hits.total}
        else:
            raise NotFound

    def unmarshall_json_dict(self, document, **options):
        super(Message, self).unmarshall_json_dict(document, **options)
        # TODO: handle html/plain flag to copy "body" key into right place
        if "body" in document and document["body"] is not None:
            self.body_plain = document["body"]

    def marshall_json_dict(self, **options):
        d = self.marshall_dict()
        # TODO: handle html/plain regarding user's preferences
        d["body"] = self.body_plain
        if "body_plain" in d:
            del (d["body_plain"])
        if "body_html" in d:
            del (d["body_html"])
        return self._json_model(d).serialize()
