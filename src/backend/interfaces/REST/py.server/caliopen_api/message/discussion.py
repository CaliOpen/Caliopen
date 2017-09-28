import logging

from cornice.resource import resource, view

from caliopen_main.discussion.core.discussion import MainView
from ..base import Api
from pyramid.httpexceptions import HTTPBadRequest, HTTPMovedPermanently

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
        try:
            il_range = self.request.authenticated_userid._get_il_range()
        except Exception as exc:
            log.warn(exc)
            raise HTTPBadRequest

        view = MainView()
        result = view.get(self.user, pi_range[0], pi_range[1],
                          il_range[0], il_range[1],
                          limit=self.get_limit(),
                          offset=self.get_offset())

        return {'discussions': result['discussions'],
                'total': result['total']}

    @view(renderer='json', permission='authenticated')
    def get(self):
        # LEGACY CODE. ROUTE MOVED TO API V2
        # discussion_id = self.request.swagger_data['discussion_id']
        # try:
        #     discussion = UserDiscussion.get(self.user, discussion_id)
        # except NotFound:
        #     raise ResourceNotFound('No such discussion %r' % discussion_id)
        #
        # dim = DIM(self.user.id)
        #
        # indexed_discussion = dim.get_by_id(discussion_id)
        # if indexed_discussion:
        #     resp = build_discussion(discussion, indexed_discussion)
        # else:
        #     raise ResourceNotFound(
        #         'Discussion {} not found in index'.format(discussion_id))
        #
        # return resp
        discussion_id = self.request.swagger_data['discussion_id']
        raise HTTPMovedPermanently(
            location="/v2/messages?discussion_id=" + discussion_id)
