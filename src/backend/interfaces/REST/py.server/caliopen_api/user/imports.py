import logging
import os.path

from caliopen_main.user.core import Contact as CoreContact

from cornice.resource import resource, view
from pyramid.response import Response

from caliopen_main.parsers.vcard import parse_vcards
from caliopen_main.parsers.vcard import read_file

from ..base.exception import (ValidationError,
                              Unprocessable)

from ..base import Api

log = logging.getLogger(__name__)


@resource(collection_path='/imports', path='')
class ContactImport(Api):

    def __init__(self, request):
        self.request = request
        self.user = request.authenticated_userid

    @view(permission='authenticated')
    def collection_post(self):

        data = self.request.body
        vcards = read_file(data, False)
        try:
            new_contacts = parse_vcards(vcards)
        except Exception as exc:
            log.error('Syntax error: {}'.format(exc))
            raise ValidationError(exc)
        try:
            for i in new_contacts:
                CoreContact.create(self.user, i)
        except Exception as exc:
            log.error('File valid but we can create the new contact: {}'.format(exc))
            raise Unprocessable(exc)

        return Response(status=200)
