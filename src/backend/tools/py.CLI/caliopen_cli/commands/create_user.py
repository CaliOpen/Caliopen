"""Create a user with a password in a Calipen instance."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from caliopen_storage.config import Configuration

log = logging.getLogger(__name__)


def create_user(**kwargs):
    """Create user in Caliopen instance."""
    from caliopen_main.user.core import User
    from caliopen_main.user.parameters import NewUser
    from caliopen_main.contact.parameters import NewContact
    from caliopen_main.contact.parameters import NewEmail

    # Fill core registry
    from caliopen_main.message.objects.message import Message

    param = NewUser()
    param.name = kwargs['email']
    if '@' in param.name:
        username, domain = param.name.split('@')
        param.name = username
        # Monkey patch configuration local_domain with provided value
        conf = Configuration('global').configuration
        conf['default_domain'] = domain
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
    log.info('User %s (%s) created' % (user.user_id, user.name))
