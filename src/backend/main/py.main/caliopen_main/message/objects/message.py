# -*- coding: utf-8 -*-
"""Caliopen message object classes."""

from caliopen_main.common.objects.base import ObjectIndexable

from uuid import UUID
import datetime
import pytz
import json
import copy

from caliopen_storage.config import Configuration
from caliopen_main.pi.objects import PIObject

from ..store import Message as ModelMessage
from ..store import IndexedMessage
from ..parameters.message import Message as ParamMessage
from ..parameters.draft import Draft
from ..core import RawMessage
from .attachment import MessageAttachment
from .external_references import ExternalReferences
from caliopen_main.participant.objects.participant import Participant
from schematics.types import UUIDType
from caliopen_main.participant.parameters import \
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
        'date_sort': datetime.datetime,
        'discussion_id': str,
        'external_references': ExternalReferences,
        'importance_level': int,
        'is_answered': bool,
        'is_draft': bool,
        'is_unread': bool,
        'is_received': bool,
        'message_id': UUID,
        'parent_id': UUID,
        'participants': [Participant],
        'privacy_features': dict,
        'pi': PIObject,
        'raw_msg_id': UUID,
        'subject': str,
        'tags': [str],
        'protocol': str,
        'user_id': UUID,
        'user_identities': [UUID],
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

    @property
    def external_msg_id(self):
        if self.external_references:
            return self.external_references.message_id
        return None

    @property
    def user_identity(self):
        """
        return first user_identity
        """
        return self.user_identities[0] if self.user_identities else None

    @classmethod
    def create_draft(cls, user, **params):
        """
        Create and save a new message (draft) for an user.

        :params: a NewMessage dict
        """
        # silently remove unexpected props within patch if not in strict mode
        strict_patch = Configuration('global').get('apiV1.strict_patch', False)
        if not strict_patch:
            allowed_properties = [
                "body",
                "message_id",
                "parent_id",
                "participants",
                "subject",
                "user_identities",
                "privacy_features",
            ]
            for key, value in params.items():
                if key not in allowed_properties:
                    del (params[key])
        try:
            draft_param = Draft(params, strict=strict_patch)
            if draft_param.message_id:
                draft_param.validate_uuid(user.user_id)
            else:
                draft_param.message_id = uuid.uuid4()
            discussion_id = draft_param.validate_consistency(user, True)
        except Exception as exc:
            log.warn("create_draft error %r" % exc)
            raise exc

        message = Message(user)
        message.unmarshall_json_dict(draft_param.to_primitive())
        message.user_id = UUID(user.user_id)
        message.is_draft = True
        message.is_received = False
        message.discussion_id = discussion_id

        if not message.protocol:
            log.warn("failed to pick a protocol")
            raise Exception("`message protocol is missing")

        # forbid multiple protocol
        for participant in message.participants:
            if participant.protocol != message.protocol:
                log.warning("Different protocols detected {0} and {1}".
                            format(participant.protocol, message.protocol))

        message.date = message.date_sort = message.date_insert = \
            datetime.datetime.now(tz=pytz.utc)
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

    def patch_draft(self, user, patch, **options):
        """Operation specific to draft, before applying generic patch."""
        try:
            params = dict(patch)
        except Exception as exc:
            log.info(exc)
            raise err.PatchError(message=exc.message)
        # silently remove unexpected props within patch if not in strict mode
        strict_patch = Configuration('global').get('apiV1.strict_patch', False)
        if not strict_patch:
            allowed_properties = [
                "body",
                "current_state",
                "user_identities",
                "message_id",
                "parent_id",
                "participants",
                "subject",
                "privacy_features",
            ]
            for key, value in params.items():
                if key not in allowed_properties:
                    del (params[key])

            for key, value in params["current_state"].items():
                if key not in allowed_properties:
                    del (params["current_state"][key])

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
            current_state = params.pop("current_state")
            draft_param = Draft(params, strict=strict_patch)
        except Exception as exc:
            log.info(exc)
            raise err.PatchError(message=exc.message)

        # add missing params to be able to check consistency
        self_dict = self.marshall_dict()
        if "message_id" not in params and self.message_id:
            draft_param.message_id = UUIDType().to_native(self.message_id)

        if "parent_id" not in params and self.parent_id:
            draft_param.parent_id = UUIDType().to_native(self.parent_id)

        if "subject" not in params:
            draft_param.subject = self.subject

        if "participants" not in params and self.participants:
            for participant in self_dict['participants']:
                indexed = IndexedParticipant(participant)
                draft_param.participants.append(indexed)


        if "user_identities" not in params and self.user_identities:
            draft_param.user_identities = self_dict["user_identities"]

        # make sure the <from> participant is present
        # and is consistent with selected user's identity
        try:
            new_discussion_id = draft_param.validate_consistency(user, False)
        except Exception as exc:
            log.info("consistency validation failed with err : {}".format(exc))
            raise err.PatchError(message=exc.message)

        validated_draft = draft_param.serialize()
        validated_params = copy.deepcopy(params)

        if "participants" in params:
            validated_params["participants"] = validated_draft["participants"]
        if new_discussion_id != self.discussion_id:
            # discussion_id has changed, update draft's discussion_id
            current_state["discussion_id"] = self.discussion_id
            validated_params["discussion_id"] = new_discussion_id

        # remove empty ids from current state if any
        if "parent_id" in current_state and current_state["parent_id"] == "":
            del (current_state["parent_id"])

        # handle body key mapping to body_plain or body_html
        # TODO: handle plain/html flag to map to right field
        if "body" in validated_params:
            validated_params["body_plain"] = validated_params["body"]
            del (validated_params["body"])
        if "body" in current_state:
            current_state["body_plain"] = current_state["body"]
            del (current_state["body"])

        # date should reflect last edit time
        current_state["date"] = self.date
        current_state["date_sort"] = self.date_sort
        validated_params["date"] = validated_params["date_sort"] = \
            datetime.datetime.now(tz=pytz.utc)

        validated_params["current_state"] = current_state

        if "participants" in current_state and self.participants:
            # replace participants' label and contact_ids
            # because frontend has up-to-date data for these properties
            # which are probably not the one stored in db
            db_parts = {}
            for p in self_dict['participants']:
                db_parts[p['protocol'] + p['type'] + p['address']] = p
            for i, p in enumerate(current_state['participants']):
                current_state['participants'][i] =  db_parts[p['protocol'] + p['type'] + p['address']]

        try:
            self.apply_patch(validated_params, **options)
        except Exception as exc:
            log.info("apply_patch() failed with error : {}".format(exc))
            raise exc

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
