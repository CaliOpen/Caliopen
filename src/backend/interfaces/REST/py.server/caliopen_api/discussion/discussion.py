import logging

from cornice.resource import resource, view

from caliopen_main.discussion.core.discussion import MainView
from ..base import Api
from caliopen_storage.exception import NotFound
from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound

log = logging.getLogger(__name__)


@resource(collection_path='/discussions',
          path='/discussions/{discussion_id}')
class Discussion(Api):
    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='json', permission='authenticated')
    def collection_get(self):
        try:
            il_range = self.request.authenticated_userid._get_il_range()
        except Exception as exc:
            log.warn(exc)
            raise HTTPBadRequest

        view = MainView()
        result = view.get(self.user, il_range[0], il_range[1],
                          limit=self.get_limit(),
                          offset=self.get_offset())

        return {'discussions': result['discussions'],
                'total': result['total']}

    @view(renderer='json', permission='authenticated')
    def get(self):
        discussion_id = self.request.swagger_data['discussion_id']
        if not discussion_id:
            raise HTTPBadRequest
        try:
            il_range = self.request.authenticated_userid._get_il_range()
        except Exception as exc:
            log.warn(exc)
            raise HTTPBadRequest

        try:
            # TODO : get discussion's hashes before querying index
            discussion_view = MainView().get_one(self.user, discussion_id,
                                                 il_range[0],
                                                 il_range[1])
        except NotFound:
            raise HTTPNotFound

        return discussion_view
