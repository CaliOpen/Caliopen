import logging

from cornice.resource import resource, view
from pyramid.httpexceptions import HTTPExpectationFailed

from caliopen_main.message.core import (Thread as UserDiscussion,
                                        ReturnThread as ReturnDiscussion)
from ..base import Api
from caliopen_storage.exception import NotFound
from ..base.exception import ResourceNotFound

log = logging.getLogger(__name__)


@resource(collection_path='/discussions',
          path='/discussions/{discussion_id}')
class Discussion(Api):

    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='json', permission='authenticated')
    def collection_get(self):
        pi_range = self.request.authenticated_userid.pi_range
        result = UserDiscussion.main_view(self.user, pi_range[0], pi_range[1],
                                          limit=self.get_limit(),
                                          offset=self.get_offset())

        # temporary hack to rename 'thread_id' key to 'discussion_id'
        for x in result['discussions']:
            x['discussion_id'] = x.pop('thread_id')

        return {'discussions': result['discussions'],
                'total': result['total']}

    @view(renderer='json', permission='authenticated')
    def get(self):
        discussion_id = self.request.matchdict.get('discussion_id')
        pi_range = self.request.authenticated_userid.pi_range
        try:
            discussion = UserDiscussion.get(self.user, discussion_id)
        except NotFound:
            raise ResourceNotFound('No such discussion %r' % discussion_id)
        if pi_range[0] > discussion.privacy_index < pi_range[1]:
            raise HTTPExpectationFailed('Invalid pi range')
        resp = ReturnDiscussion.build(discussion).serialize()
        # temporary hack to rename 'thread_id' key to 'discussion_id'
        resp['discussion_id'] = resp.pop('thread_id')
        return {'discussion': resp}
