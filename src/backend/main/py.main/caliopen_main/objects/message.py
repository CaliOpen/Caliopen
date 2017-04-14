# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import types
from caliopen_main.objects import base

import uuid
from uuid import UUID
import datetime
import json
import re

from caliopen_main.message.store import Message as ModelMessage
from caliopen_main.message.store import IndexedMessage
from caliopen_main.message.parameters.message import (Message as ParamMessage,
                                                      NewMessage)
from caliopen_main.message.core import RawMessage
from .tag import ResourceTag
from .attachment import MessageAttachment
from .external_references import ExternalReferences
from .identities import Identity, LocalIdentity
from caliopen_main.user.core import User
from .participant import Participant
from .privacy_features import PrivacyFeatures
import caliopen_main.errors as err
from caliopen_storage.exception import NotFound
from caliopen_main.discussion.store.discussion_index import \
    DiscussionIndexManager as DIM

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
            message_param = NewMessage(params)
            message_param.validate()
            valid_draft = Message.validate_draft_consistency(user_id,
                                                             message_param,
                                                             True)
        except Exception as exc:
            log.warn(exc)
            raise exc

        message = Message()
        message.unmarshall_json_dict(valid_draft)
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
            message_param = NewMessage(params)
            message_param.validate()
            valid_draft = Message.validate_draft_consistency(self.user_id,
                                                             message_param,
                                                             False)
            print(valid_draft)
        except Exception as exc:
            log.warn(exc)
            return err.PatchError(message=exc.message)

        self.apply_patch(patch, **options)

    @classmethod
    def validate_draft_consistency(cls, user_id, draft, is_new):
        """
        Function used by create_draft and patch_draft
        to unsure provided params are consistent with draft's context
        
        :param user_id as a string
        :param draft is a dict conforming to Message param models
        :param is_new : if true indicates that we want to validate a new draft,
                                    otherwise it is an update of existing one
                            
        If needed, draft is modified to conform.
        Returns a validated draft or error.
        """
        # remove 'from' participant
        if 'participants' in draft and len(draft['participants']) > 0:
            participants = draft['participants']
            for i, participant in enumerate(participants):
                if re.match("[Ff][Rr][Oo][Mm]", participant['type']):
                    participants.pop(i)

        if is_new:
            if 'identities' not in draft:
                raise err.PatchUnprocessable

            if len(draft['identities']) != 1:
                raise err.PatchUnprocessable

            provided_identity = draft['identities'][0]
            local_identity = LocalIdentity(
                identifier=provided_identity['identifier'])
            try:
                local_identity.get_db()
                local_identity.unmarshall_db()
            except NotFound:
                raise NotFound
            if str(local_identity.user_id) != user_id:
                raise err.ForbiddenAction

            # add 'from' participant with local identity's identifier
            user = User.get(user_id)
            if 'participants' not in draft:
                draft['participants'] = []
            participants = draft['participants']
            from_participant = Participant()
            from_participant.address = local_identity.identifier
            from_participant.label = local_identity.display_name
            from_participant.protocol = "email"
            from_participant.type = "From"
            from_participant.contact_ids = [user.contact.contact_id]
            participants.append(from_participant.marshall_dict())

        # discussion consistency
        new_discussion = False
        if 'discussion_id' not in draft or draft['discussion_id'] == "" \
                or draft['discussion_id'] is None:
            # no discussion_id provided. Try to find one with draft's parent_id
            # or create new discussion
            if 'parent_id' in draft and draft['parent_id'] != "" \
                    and draft['parent_id'] is not None:
                parent_msg = Message(user_id, message_id=draft['parent_id'])
                try:
                    parent_msg.get_db()
                    parent_msg.unmarshall_db()
                except NotFound:
                    raise err.PatchError(message="parent message not found")
                draft['discussion_id'] = parent_msg.discussion_id
            else:
                draft['discussion_id'] = uuid.uuid4()
                new_discussion = True

        if not new_discussion:
            dim = DIM(user.user_id)
            d_id = draft['discussion_id']
            last_message = dim.get_last_message(d_id, 0, 100)
            if last_message == {}:
                raise err.PatchError(
                    message='No such discussion {}'.format(d_id))

            # check participants consistency
            if 'participants' in draft and len(draft['participants']) > 0:
                participants = [p['address'] for p in draft['participants']]
                last_msg_participants = [p['address'] for p in
                                         last_message['participants']]
                if len(participants) != len(last_msg_participants):
                    raise err.PatchError(
                        message="list of participants "
                                "is not consistent for this discussion")
                participants.sort()
                last_msg_participants.sort()
                for i, participant in enumerate(participants):
                    if participant != last_msg_participants[i]:
                        raise err.PatchConflict(
                            message="list of participants "
                                    "is not consistent for this discussion")
            else:
                # no participant provided : should not happen within a reply
                raise err.PatchError(
                    message="No participants provided for this reply")

            # check parent_id consistency
            if 'parent_id' in draft and draft['parent_id'] != "" \
                    and draft['parent_id'] is not None:
                if not dim.get_a_message_id(draft['discussion_id'],
                                            draft['parent_id']):
                    raise err.PatchConflict(message="provided message "
                                                    "parent_id does not belong"
                                                    "to this discussion")

            # check subject consistency
            if 'subject' in draft:
                if draft['subject'] != last_message['subject']:
                    raise err.PatchConflict(message="subject has been changed")
            else:
                draft['subject'] = last_message['subject']

        # prevent modification of protected attributes
        # TODO: below attributes should be protected by Message class

        return draft

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
