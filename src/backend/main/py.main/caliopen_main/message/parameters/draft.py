# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import re
import uuid

from .message import NewMessage
from caliopen_main.objects.identities import LocalIdentity
from caliopen_main.user.core import User
from caliopen_main.objects.participant import Participant
from caliopen_storage.exception import NotFound
from caliopen_main.discussion.store.discussion_index import \
    DiscussionIndexManager as DIM
from caliopen_main.discussion.core import Discussion
import caliopen_main.errors as err

import logging

log = logging.getLogger(__name__)


class Draft(NewMessage):
    def validate_consistency(self, user_id, is_new):
        """
        Function used by create_draft and patch_draft
        to unsure provided params are consistent with draft's context
        
        :param user_id as a string
        :param is_new : if true indicates that we want to validate a new draft,
                                    otherwise it is an update of existing one
                            
        If needed, draft is modified to conform.
        Returns a validated draft or error.
        """

        try:
            self.validate()
        except Exception as exc:
            log.warn(exc)
            raise exc

        if is_new and self.discussion_id is None:
            if hasattr(self, 'participants') and len(self.participants) > 0:
                for i, participant in enumerate(self.participants):
                    if re.match("[Ff][Rr][Oo][Mm]", participant.type):
                        self.participants.pop(i)
            self._add_from_participant(user_id)

        # check discussion consistency and get last message from discussion
        last_message = self._check_discussion_consistency(user_id)

        if last_message is not None:
            # check subject consistency
            # TODO: handle encoded subject lines & international suffix
            # (https://www.wikiwand.com/en/List_of_email_subject_abbreviations)
            # for now, we use standard prefix «Re: » (RFC5322#section-3.6.5)
            if hasattr(self, 'subject') and self.subject is not None:
                if self.subject != "Re: " + last_message.subject:
                    raise err.PatchConflict(message="subject has been changed")
            else:
                # no subject property provided :
                # add subject from context with a "Re: " prefix
                self.subject = "Re: " + last_message.subject

            # TODO: prevent modification of protected attributes
                # below attributes should be protected by Message class

    def _add_from_participant(self, user_id):

        if 'identities' not in self:
            raise err.PatchUnprocessable

        if len(self['identities']) != 1:
            raise err.PatchUnprocessable

        provided_identity = self['identities'][0]
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
        if not hasattr(self, 'participants'):
            self.participants = []
        from_participant = Participant()
        from_participant.address = local_identity.identifier
        from_participant.label = local_identity.display_name
        from_participant.protocol = "email"
        from_participant.type = "From"
        from_participant.contact_ids = [user.contact.contact_id]
        self.participants.append(from_participant.marshall_dict())

    def _check_discussion_consistency(self, user_id):
        from caliopen_main.objects.message import Message
        new_discussion = False

        if not hasattr(self, 'discussion_id') or self.discussion_id == "" \
                or self.discussion_id is None:
            # no discussion_id provided. Try to find one with draft's parent_id
            # or create new discussion
            if hasattr(self, 'parent_id') and self.parent_id != "" \
                    and self.parent_id is not None:
                parent_msg = Message(user_id, message_id=self.parent_id)
                try:
                    parent_msg.get_db()
                    parent_msg.unmarshall_db()
                except NotFound:
                    raise err.PatchError(message="parent message not found")
                self.discussion_id = parent_msg.discussion_id
            else:
                user = User.get(user_id)
                discussion = Discussion.create_from_message(user, self)
                self.discussion_id = discussion.discussion_id
                new_discussion = True

        if not new_discussion:
            dim = DIM(user_id)
            d_id = self.discussion_id
            last_message = dim.get_last_message(d_id, 0, 100, False)
            if last_message == {}:
                raise err.PatchError(
                    message='No such discussion {}'.format(d_id))

            # check participants consistency
            if hasattr(self, "participants") and len(self.participants) > 0:
                participants = [p['address'] for p in self.participants]
                last_msg_participants = [p['address'] for p in
                                         last_message.participants]
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
                # TODO: handle empty participants list within a reply
                raise err.PatchError(
                    message="No participants provided for this reply")

            # check parent_id consistency
            if 'parent_id' in self and self['parent_id'] != "" \
                    and self['parent_id'] is not None:
                if not dim.get_message_id(self['discussion_id'],
                                          self['parent_id']):
                    raise err.PatchConflict(message="provided message "
                                                    "parent_id does not belong"
                                                    "to this discussion")
        else:
            last_message = None

        return last_message
