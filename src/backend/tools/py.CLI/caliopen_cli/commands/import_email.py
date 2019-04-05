"""
This script parse mail from a mbox or maildir format and import them.

User must be created before import

"""
from __future__ import absolute_import, print_function, unicode_literals

import os
import re
from random import random
import logging
import uuid

from email import message_from_string, message_from_file
from mailbox import mbox, Maildir

from caliopen_storage.exception import NotFound

log = logging.getLogger(__name__)


def import_email(email, import_path, format, contact_probability,
                 **kwargs):
    """Import emails for an user."""
    from caliopen_main.user.core import User
    from caliopen_main.contact.core import Contact, ContactLookup
    from caliopen_main.message.parsers.mail import MailMessage
    from caliopen_main.contact.parameters import NewContact, NewEmail
    from caliopen_nats.delivery import UserMailDelivery
    from caliopen_main.message.core import RawMessage
    from caliopen_main.participant.core import ParticipantLookup
    from caliopen_storage.config import Configuration

    max_size = int(Configuration("global").get("object_store.db_size_limit"))

    if 'to' in kwargs and kwargs['to']:
        dest_email = kwargs['to']
    else:
        dest_email = email

    if format == 'maildir':
        if dest_email != email:
            raise Exception('Cannot change To email using maildir format')
        emails = Maildir(import_path, factory=message_from_file)
        mode = 'maildir'
    else:
        if os.path.isdir(import_path):
            mode = 'mbox_directory'
            emails = {}
            files = [f for f in os.listdir(import_path) if
                     os.path.isfile(os.path.join(import_path, f))]
            for f in files:
                try:
                    log.debug('Importing mail from file {}'.format(f))
                    with open('%s/%s' % (import_path, f)) as fh:
                        data = fh.read()
                        data = re.sub('^To: (.*)', 'To: %s' % dest_email,
                                      data, flags=re.MULTILINE)
                        emails[f] = message_from_string(data)
                except Exception as exc:
                    log.error('Error importing email {}'.format(exc))
        else:
            mode = 'mbox'
            emails = mbox(import_path)

    user = User.by_local_identifier(dest_email, 'email')

    log.info("Processing mode %s" % mode)

    for key, data in emails.iteritems():
        # Prevent creating message too large to fit in db.
        # (should use inject cmd for large messages)
        size = len(data.as_string())
        if size > max_size:
            log.warn("Message too large to fit into db. \
            Please, use 'inject' cmd for importing large emails.")
            continue

        raw = RawMessage.create(data.as_string())
        log.debug('Created raw message {}'.format(raw.raw_msg_id))
        message = MailMessage(data.as_string())
        dice = random()
        if dice <= contact_probability:
            for participant in message.participants:
                try:
                    ContactLookup.get(user, participant.address)
                except NotFound:
                    log.info('Creating contact %s' % participant.address)
                    name, domain = participant.address.split('@')
                    contact_param = NewContact()
                    contact_param.family_name = name
                    if participant.address:
                        e_mail = NewEmail()
                        e_mail.address = participant.address
                        contact_param.emails = [e_mail]
                    contact = Contact.create(user, contact_param)
                    # create related participants for contact and its emails
                    contact_participant_id = uuid.uuid4()
                    ParticipantLookup.get_or_create(user, contact.contact_id,
                                                    'contact',
                                                    contact_participant_id)
                    for email in contact.emails:
                        ParticipantLookup.get_or_create(user, email.address,
                                                        'email',
                                                        contact_participant_id)
        else:
            log.info('No contact associated to raw {} '.format(raw.raw_msg_id))

        processor = UserMailDelivery(user,
                                     user.local_identities[
                                         0])  # assume one local identity
        try:
            obj_message = processor.process_raw(raw.raw_msg_id)
        except Exception as exc:
            log.exception(exc)
        else:
            log.info('Created message {}'.format(obj_message.message_id))
