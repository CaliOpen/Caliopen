# -*- coding: utf-8 -*-
"""Caliopen ReST API for user settings management."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from pyramid.response import Response
from caliopen_main.user.objects.settings import Settings as ObjectSettings
from cornice.resource import resource, view

from ..base import Api
from ..base.context import DefaultContext

from ..base.exception import MergePatchError

log = logging.getLogger(__name__)


@resource(path='/api/v1/settings',
          name='Settings',
          factory=DefaultContext
          )
class SettingsAPI(Api):
    """Settings management API."""

    def __init__(self, request, context):
        """Create an instance of Device API."""
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='json', permission='authenticated')
    def get(self):
        """Return user settings."""
        objects = ObjectSettings.list_db(self.user.user_id)
        settings = [x.marshall_dict() for x in objects]
        return settings[0]

    @view(renderer='json', permission='authenticated')
    def patch(self):
        """Update settings with payload.
        method follows the rfc5789 PATCH and rfc7396 Merge patch
        specifications, + 'current_state' caliopen's specs.
        stored messages are modified according to the fields within the
        payload, ie payload fields squash existing db fields, no other
        modification done. If message doesn't existing, response is 404.
        If payload fields are not conform to the message db schema, response is
        422 (Unprocessable Entity).
        Successful response is 204, without a body.
        """
        patch = self.request.json

        settings = ObjectSettings(self.user.user_id)
        error = settings.apply_patch(patch, db=True)
        if error is not None:
            raise MergePatchError(error)

        return Response(None, 204)
