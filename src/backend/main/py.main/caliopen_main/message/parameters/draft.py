# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import re
import uuid

from .message import NewMessage
#
from caliopen_main.objects.identities import LocalIdentity
from caliopen_main.user.core import User
from caliopen_main.objects.participant import Participant
from caliopen_storage.exception import NotFound
from caliopen_main.discussion.store.discussion_index import \
    DiscussionIndexManager as DIM
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
        # remove 'from' participant

        try:
            self.validate()
        except Exception as exc:
            log.warn(exc)
            raise exc

        if 'participants' in self and len(self['participants']) > 0:
            participants = self['participants']
            for i, participant in enumerate(participants):
                if re.match("[Ff][Rr][Oo][Mm]", participant['type']):
                    participants.pop(i)

        if is_new:
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
            if 'participants' not in self:
                self['participants'] = []
            participants = self['participants']
            from_participant = Participant()
            from_participant.address = local_identity.identifier
            from_participant.label = local_identity.display_name
            from_participant.protocol = "email"
            from_participant.type = "From"
            from_participant.contact_ids = [user.contact.contact_id]
            participants.append(from_participant.marshall_dict())

        from caliopen_main.objects.message import \
            Message  # objects/Message and Draft reference each other
        # discussion consistency
        new_discussion = False
        if 'discussion_id' not in self or self['discussion_id'] == "" \
                or self['discussion_id'] is None:
            # no discussion_id provided. Try to find one with draft's parent_id
            # or create new discussion
            if 'parent_id' in self and self['parent_id'] != "" \
                    and self['parent_id'] is not None:
                parent_msg = Message(user_id, message_id=self['parent_id'])
                try:
                    parent_msg.get_db()
                    parent_msg.unmarshall_db()
                except NotFound:
                    raise err.PatchError(message="parent message not found")
                self['discussion_id'] = parent_msg.discussion_id
            else:
                self['discussion_id'] = uuid.uuid4()
                new_discussion = True

        if not new_discussion:
            dim = DIM(user.user_id)
            d_id = self['discussion_id']
            last_message = dim.get_last_message(d_id, 0, 100)
            if last_message == {}:
                raise err.PatchError(
                    message='No such discussion {}'.format(d_id))

            # check participants consistency
            if 'participants' in self and len(self['participants']) > 0:
                participants = [p['address'] for p in self['participants']]
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
            if 'parent_id' in self and self['parent_id'] != "" \
                    and self['parent_id'] is not None:
                if not dim.get_message_id(self['discussion_id'],
                                          self['parent_id']):
                    raise err.PatchConflict(message="provided message "
                                                    "parent_id does not belong"
                                                    "to this discussion")

            # check subject consistency
            if 'subject' in self:
                if self['subject'] != last_message['subject']:
                    raise err.PatchConflict(message="subject has been changed")
            else:
                self['subject'] = last_message['subject']

                # prevent modification of protected attributes
                # TODO: below attributes should be protected by Message class
