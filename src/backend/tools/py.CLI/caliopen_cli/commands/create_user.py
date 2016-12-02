"""
Create a user with a password in a Calipen instance
"""
from __future__ import absolute_import, print_function, unicode_literals

import logging
log = logging.getLogger(__name__)


def create_user(**kwargs):

    from caliopen_main.user.core import User
    from caliopen_main.user.parameters import NewUser
    from caliopen_main.user.parameters import NewContact
    from caliopen_main.user.parameters import NewEmail
    param = NewUser()
    param.name = kwargs['email']
    param.password = kwargs['password']
    contact = NewContact()
    contact.given_name = kwargs.get('given_name')
    contact.family_name = kwargs.get('family_name')
    email = NewEmail()
    email.address = param.name
    param.contact = contact
    user = User.create(param)
    user.save()
    log.info('User %s (%s) created' % (user.user_id, user.user_name))
