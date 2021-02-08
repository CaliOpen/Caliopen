# -*- coding: utf-8 -*-

# resync index. This command will delete the current index for an user
# And rebuild it entirely using cassandra data
#

from __future__ import absolute_import, print_function, unicode_literals

import logging
import sys

from caliopen_storage.config import Configuration
from elasticsearch import Elasticsearch

log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)


def resync_user(user):
    """Resync data for an user into its index shard."""
    from caliopen_main.contact.store import Contact
    from caliopen_main.contact.objects import Contact as ContactObject
    from caliopen_main.message.store import Message
    from caliopen_main.message.objects import Message as MessageObject

    log.info('Sync user {0} into shard {1}'.format(user.user_id,
             user.shard_id))

    client = Elasticsearch(Configuration('global').get('elasticsearch.url'))
    body = {'filter': {'term': {'user_id': user.user_id}}}
    # if not client.indices.exists_alias(user.user_id):
    #     log.info('Creating alias {} for index {}'.format(user.user_id, user.shard_id))
    client.indices.put_alias(user.shard_id, user.user_id, body=body)

    contacts = Contact.filter(user_id=user.user_id).timeout(None)
    for contact in contacts:
        log.debug('Reindex contact %r' % contact.contact_id)
        obj = ContactObject(user, contact_id=contact.contact_id)
        obj.get_db()
        obj.unmarshall_db()
        obj.create_index()

    messages = Message.filter(user_id=user.user_id). \
        allow_filtering().timeout(None)
    for message in messages:
        log.debug('Reindex message %r' % message.message_id)
        obj = MessageObject(user, message_id=message.message_id)
        obj.get_db()
        obj.unmarshall_db()
        obj.create_index()


def resync_shard_index(**kwargs):
    """Resync all index of a shard."""
    from caliopen_main.user.core import User
    from caliopen_main.user.core.setups import setup_shard_index

    shard_id = kwargs['shard_id']
    old_shard_id = kwargs.get('old_shard_id')
    if not old_shard_id:
        old_shard_id = shard_id
    shards = Configuration('global').get('elasticsearch.shards')
    if shard_id not in shards:
        log.error('Invalid shard {0}'.format(shard_id))
        sys.exit(1)

    # Recreate index and mappings
    setup_shard_index(shard_id)

    users = User._model_class.all()
    cpt = 0
    for user in users:
        if user.shard_id not in (old_shard_id, shard_id):
            continue

        if user.shard_id != shard_id:
            user.shard_id = shard_id
            user.save()
        resync_user(user)
        cpt += 1
    log.info('Sync {0} users into shards'.format(cpt))
