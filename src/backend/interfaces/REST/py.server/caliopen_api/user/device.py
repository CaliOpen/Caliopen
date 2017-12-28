# -*- coding: utf-8 -*-
"""Caliopen ReST API for user device management."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid
from pyramid.response import Response
from caliopen_main.user.objects.device import Device as ObjectDevice
from caliopen_main.user.core import Device as CoreDevice
from caliopen_main.user.parameters import NewDevice
from cornice.resource import resource, view

from ..base import Api
from ..base.context import DefaultContext

from ..base.exception import MergePatchError, ValidationError

log = logging.getLogger(__name__)


@resource(collection_path='/api/v1/devices',
          path='/api/v1/devices/{device_id}',
          name='Device',
          factory=DefaultContext
          )
class DeviceAPI(Api):
    """Device management API."""

    def __init__(self, request, context):
        """Create an instance of Device API."""
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='json', permission='authenticated')
    def collection_post(self):
        """Create a new device for an user."""
        data = self.request.json
        device_param = NewDevice(data)

        device = CoreDevice.create(self.user, device_param)
        device_url = self.request.route_path('Device',
                                             device_id=device.device_id)
        self.request.response.location = device_url
        # XXX return a Location to get device not send it direct
        return {'location': device_url}

    @view(renderer='json', permission='authenticated')
    def collection_get(self):
        """Return list of user devices."""
        objects = ObjectDevice.list_db(self.user.user_id)
        devices = [x.marshall_dict() for x in objects]
        log.debug('Devices are : {}'.format(devices))
        return {'devices': devices, 'count': len(devices)}

    @view(renderer='json', permission='authenticated')
    def get(self):
        """Get a complete device information."""
        device_id = self.request.swagger_data["device_id"]
        try:
            uuid.UUID(device_id)
        except Exception as exc:
            log.error("unable to extract device_id: {}".format(exc))
            raise ValidationError(exc)

        device = ObjectDevice(self.user.user_id, device_id=device_id)
        device.get_db()
        device.unmarshall_db()
        log.info('Found device {}'.format(device))
        return device.marshall_json_dict()

    @view(renderer='json', permission='authenticated')
    def patch(self):
        """Update a device with payload.

        method follows the rfc5789 PATCH and rfc7396 Merge patch
        specifications, + 'current_state' caliopen's specs.
        stored messages are modified according to the fields within the
        payload, ie payload fields squash existing db fields, no other
        modification done. If message doesn't existing, response is 404.
        If payload fields are not conform to the message db schema, response is
        422 (Unprocessable Entity).
        Successful response is 204, without a body.
        """
        device_id = self.request.swagger_data["device_id"]
        patch = self.request.json

        device = ObjectDevice(self.user.user_id, device_id=device_id)
        error = device.apply_patch(patch, db=True)
        if error is not None:
            raise MergePatchError(error)

        return Response(None, 204)
