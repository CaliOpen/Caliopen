# -*- coding: utf-8 -*-
"""Caliopen file import REST API."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from caliopen_main.contact.core import Contact as CoreContact

from cornice.resource import resource, view
from pyramid.response import Response

from caliopen_main.contact.parsers import VcardParser

from ..base.exception import (ValidationError,
                              Unprocessable)

from ..base import Api

log = logging.getLogger(__name__)


@resource(collection_path='/api/v1/imports', path='')
class ContactImport(Api):
    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(permission='authenticated')
    def collection_post(self):
        """API to import an user file (vcard at this time)."""
        # need to check by ourself if <file> param is present
        # because swagger lib failed to do it correctly :(
        try:
            self.request.POST.getone("file")
        except Exception as exc:
            raise ValidationError(exc)

        data = self.request.POST['file'].file
        try:
            parser = VcardParser(data)
        except Exception as exc:
            log.exception('Exception during vcard file parsing %r' % exc)
            raise ValidationError(exc)
        try:
            new_contacts = parser.parse()
        except Exception as exc:
            log.error('Syntax error: {}'.format(exc))
            raise ValidationError(exc)
        try:
            for contact in new_contacts:
                CoreContact.create(self.user, contact.contact)
        except Exception as exc:
            log.error(
                'File valid but we can create the new contact: {}'.format(exc))
            raise Unprocessable(detail=exc.message)

        return Response(status=200)
