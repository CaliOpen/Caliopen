# -*- coding: utf-8 -*-
"""Caliopen Contact REST API."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import json
import colander
import uuid
from cornice.resource import resource, view
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPServerError, \
    HTTPForbidden
from caliopen_main.common.errors import ForbiddenAction

from caliopen_main.contact.core import (Contact as CoreContact,
                                        PublicKey as CorePublicKey)

from caliopen_main.contact.objects.contact import Contact as ContactObject

from caliopen_main.contact.returns import (ReturnContact,
                                           ReturnAddress, ReturnEmail,
                                           ReturnIM, ReturnPhone,
                                           ReturnOrganization,
                                           ReturnSocialIdentity,
                                           ReturnPublicKey)

from caliopen_main.contact.parameters import (NewContact as NewContactParam,
                                              NewPostalAddress, NewEmail,
                                              NewIM)

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
        pi_range = self.request.authenticated_userid.pi_range
        filter_params = {'min_pi': pi_range[0],
                         'max_pi': pi_range[1],
                         'limit': self.get_limit(),
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

        contact = ContactObject(self.user.user_id, contact_id=contact_id)
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

        method follows the rfc5789 PATCH and rfc7396 Merge patch specifications,
        + 'current_state' caliopen's specs.
        stored messages are modified according to the fields within the payload,
        ie payload fields squash existing db fields, no other modification done.
        If message doesn't existing, response is 404.
        If payload fields are not conform to the message db schema, response is
        422 (Unprocessable Entity).
        Successful response is 204, without a body.
        """
        contact_id = self.request.swagger_data["contact_id"]
        patch = self.request.json

        contact = ContactObject(self.user.user_id, contact_id=contact_id)
        try:
            contact.apply_patch(patch, db=True, index=True,
                                with_validation=True)
        except Exception as exc:
            raise MergePatchError(error=exc)

        return Response(None, 204)

    @view(renderer='json', permission='authenticated')
    def delete(self):
        contact_id = self.request.swagger_data["contact_id"]
        contact = ContactObject(self.user.user_id, contact_id=contact_id)

        try:
            contact.delete()
        except Exception as exc:
            if isinstance(exc, ForbiddenAction):
                raise HTTPForbidden(exc)
            else:
                raise HTTPServerError(exc)

        return Response(None, 204)


class BaseSubContactApi(Api):

    """Base class for contact sub objects, not nested one."""

    core_class = None
    return_class = None
    namespace = None

    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid
        contact_id = self.request.matchdict.get('contact_id')
        self.contact = CoreContact.get(self.user, contact_id)

    @view(renderer='json', permission='authenticated')
    def collection_get(self):
        # XXX define filters from request
        objs = self.core_class.find(self.user, self.contact)
        rets = [self.return_class.build(x).serialize() for x in objs['data']]
        return {self.namespace: rets, 'total': objs['total']}

    def _create(self, contact_id, params, add_func, return_obj):
        """Create sub object from param using add_func."""
        contact = CoreContact.get(self.user, contact_id)
        created = getattr(contact, add_func)(params)
        log.debug('Created object {} for contact {}'.
                  format(created.address_id, contact.contact_id))
        return return_obj.build(created).serialize()

    def _delete(self, relation_id, delete_func):
        """Delete sub object relation_id using delete_fund."""
        contact_id = self.request.validated['contact_id']
        contact = CoreContact.get(self.user, contact_id)
        return getattr(contact, delete_func)(relation_id)


@resource(collection_path='/api/v1/contacts/{contact_id}/keys',
          path='/api/v1/contacts/{contact_id}/keys/{key_id}')
class ContactPublicKey(BaseSubContactApi):

    core_class = CorePublicKey
    return_class = ReturnPublicKey
    namespace = 'keys'
