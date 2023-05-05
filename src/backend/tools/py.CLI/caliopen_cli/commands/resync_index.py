# -*- coding: utf-8 -*-

# Resync data index for an user
#

from __future__ import absolute_import, print_function, unicode_literals

import logging
import sys
import uuid
from elasticsearch import Elasticsearch
from caliopen_storage.config import Configuration

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)


def clean_index_user(client, user):
    """Delete old data belong to an user from index."""
    query = {'query': {'term': {'user_id': user.user_id}}}
    r1 = client.delete_by_query(index=user.shard_id,
                                doc_type='indexed_message',
                                body=query)
    r2 = client.delete_by_query(index=user.shard_id,
                                doc_type='indexed_contact',
                                body=query)
    return r1['deleted'], r2['deleted']


def resync_index(**kwargs):
    """Resync an index for an user."""
    from caliopen_main.user.core import User, allocate_user_shard
    from caliopen_main.user.core.setups import setup_index
    from caliopen_main.contact.store import Contact
    from caliopen_main.contact.objects import Contact as ContactObject
    from caliopen_main.message.store import Message
    from caliopen_main.message.objects import Message as MessageObject

    if 'user_name' in kwargs and kwargs['user_name']:
        user = User.by_name(kwargs['user_name'])
    elif 'user_id' in kwargs and kwargs['user_id']:
        user = User.get(kwargs['user_id'])
    else:
        print('Need user_name or user_id parameter')
        sys.exit(1)

    es_url = Configuration('global').get('elasticsearch.url')
    es_client = Elasticsearch(es_url)

    if 'delete' in kwargs and kwargs['delete']:
        del_msg, del_con = clean_index_user(es_client, user)
        log.info('Delete of {0} old contacts and {1} old messages'.
                 format(del_con, del_msg))

    user_id = uuid.UUID(user.user_id)
    shard_id = allocate_user_shard(user_id)
    if user.shard_id != shard_id:
        log.warn('Reallocate user index shard from {} to {}'.
                 format(user.shard_id, shard_id))
        # XXX fixme. attribute should be set without using model
        user.model.shard_id = shard_id
        user.save()

    setup_index(user)

    cpt_contact = 0
    contacts = Contact.filter(user_id=user.user_id)
    for contact in contacts:
        log.debug('Reindex contact %r' % contact.contact_id)
        obj = ContactObject(user, contact_id=contact.contact_id)
        obj.get_db()
        obj.unmarshall_db()
        obj.create_index()
        cpt_contact += 1

    cpt_message = 0
    skip_message = 0
    messages = Message.filter(user_id=user.user_id).timeout(None). \
        allow_filtering()
    for message in messages:
        log.debug('Reindex message %r' % message.message_id)
        try:
            obj = MessageObject(user, message_id=message.message_id)
            obj.get_db()
            obj.unmarshall_db()
            obj.create_index()
            cpt_message += 1
        except Exception as exc:
            skip_message += 1
            log.exception(exc)
    log.info('Sync of {0} contacts, {1} messages. Skipped {2} messages.'.
             format(cpt_contact, cpt_message, skip_message))
    log.info('Create index alias %r' % user.user_id)
    try:
        es_client.indices.put_alias(index=shard_id, name=user.user_id)
    except Exception as exc:
        log.exception('Error during alias creation : {}'.format(exc))
        raise exc
