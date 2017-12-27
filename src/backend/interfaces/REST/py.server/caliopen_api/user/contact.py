# -*- coding: utf-8 -*-
"""Caliopen Contact REST API."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid
from cornice.resource import resource, view
from pyramid.response import Response
from pyramid.httpexceptions import HTTPServerError, HTTPForbidden
from caliopen_main.common.errors import ForbiddenAction

from caliopen_main.contact.core import Contact as CoreContact

from caliopen_main.contact.objects.contact import Contact as ContactObject

from caliopen_main.contact.returns import ReturnContact

from caliopen_main.contact.parameters import NewContact as NewContactParam

from ..base import Api
from ..base.exception import (ResourceNotFound,
                              ValidationError,
                              MergePatchError)

log = logging.getLogger(__name__)


@resource(collection_path='/api/v1/contacts',
          path='/api/v1/contacts/{contact_id}')
class Contact(Api):
    """Contact API."""

    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(renderer='json', permission='authenticated')
    def collection_get(self):
        filter_params = {'limit': self.get_limit(),
                         'offset': self.get_offset()}
        log.debug('Filter parameters {}'.format(filter_params))
        results = CoreContact._model_class.search(self.user, **filter_params)
        data = []
        for item in results:
            try:
                c = ReturnContact.build(
                    CoreContact.get(self.user, item.contact_id)). \
                    serialize()
                data.append(c)
            except Exception as exc:
                log.error("unable to serialize contact : {}".format(exc))

        return {'contacts': data, 'total': results.hits.total}

    @view(renderer='json', permission='authenticated')
    def get(self):
        contact_id = self.request.swagger_data["contact_id"]
        try:
            uuid.UUID(contact_id)
        except Exception as exc:
            log.error("unable to extract contact_id: {}".format(exc))
            raise ValidationError(exc)

        contact = ContactObject(user=self.user, contact_id=contact_id)
        try:
            contact.get_db()
            contact.unmarshall_db()
        except Exception as exc:
            log.warn(exc)
            raise ResourceNotFound(detail=exc.message)
        return contact.marshall_json_dict()

    @view(renderer='json', permission='authenticated')
    def collection_post(self):
        """Create a new contact from json post data structure."""
        data = self.request.json
        contact_param = NewContactParam(data)
        try:
            contact_param.validate()
            if hasattr(contact_param, "tags") and contact_param.tags:
                raise ValidationError(
                    "adding tags through parent object is forbidden")
        except Exception as exc:
            raise ValidationError(exc)
        contact = CoreContact.create(self.user, contact_param)
        contact_url = self.request.route_path('contact',
                                              contact_id=contact.contact_id)
        self.request.response.location = contact_url
        # XXX return a Location to get contact not send it direct
        return {'location': contact_url}

    @view(renderer='json', permission='authenticated')
    def patch(self):
        """Update a contact with payload.

        method follows the rfc5789 PATCH and rfc7396 Merge
        patch specifications, + 'current_state' caliopen's specs.
        stored messages are modified according to the fields within
        the payload, ie payload fields squash existing db fields,
        no other modification done.
        If message doesn't existing, response is 404.
        If payload fields are not conform to the message db schema, response is
        422 (Unprocessable Entity).
        Successful response is 204, without a body.
        """
        contact_id = self.request.swagger_data["contact_id"]
        patch = self.request.json

        contact = ContactObject(user=self.user, contact_id=contact_id)
        try:
            contact.apply_patch(patch, db=True, index=True,
                                with_validation=True)
        except Exception as exc:
            raise MergePatchError(error=exc)

        return Response(None, 204)

    @view(renderer='json', permission='authenticated')
    def delete(self):
        contact_id = self.request.swagger_data["contact_id"]
        contact = ContactObject(user=self.user, contact_id=contact_id)

        try:
            contact.delete()
        except Exception as exc:
            if isinstance(exc, ForbiddenAction):
                raise HTTPForbidden(exc)
            else:
                raise HTTPServerError(exc)

        return Response(None, 204)
