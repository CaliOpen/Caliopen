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

    # Fill core registry
    from caliopen_main.message.core import Message

    param = NewUser()
    param.name = kwargs['email']
    param.password = kwargs['password']
    param.recovery_email = u'{}@caliopen.local'.format(param.name)

    contact = NewContact()
    contact.given_name = kwargs.get('given_name')
    contact.family_name = kwargs.get('family_name')
    email = NewEmail()
    email.address = param.recovery_email
    contact.emails = [email]
    param.contact = contact
    user = User.create(param)
    user.save()
    log.info('User %s (%s) created' % (user.user_id, user.user_name))
