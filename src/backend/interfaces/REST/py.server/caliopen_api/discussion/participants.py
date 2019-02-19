import logging

from cornice.resource import resource, view

from ..base import Api
from caliopen_main.message.parameters import NewMessage, Participant
from caliopen_main.discussion.core import Discussion

log = logging.getLogger(__name__)


@resource(collection_path='/participants/discussion',
          path='/participants/discussion')
class ParticipantDiscussion(Api):
    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='json', permission='authenticated')
    def collection_post(self):
        participants = self.request.swagger_data['participants']
        msg = NewMessage()
        parts = []
        for part in participants:
            participant = Participant()
            participant.address = part['address']
            participant.label = part['label']
            participant.protocol = part['protocol']
            participant.contact_id = part.get('contact_ids', [])
            parts.append(participant)
        msg.participants = parts
        did = ''
        if parts:
            hashed = msg.hash_participants
            discussion = Discussion.by_hash(self.user, hashed)
            did = discussion.discussion_id if discussion else ''
        return {'hash': hashed,
                'discussion_id': did}
