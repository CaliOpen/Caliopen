# -*- coding: utf-8 -*-
"""Caliopen disccions index classes.

Discussions are not really indexed, they are result of messages aggregations.

So there is not direct document mapping, only helpers to find discussions
and build a suitable representation for displaying.

"""
from __future__ import absolute_import, print_function, unicode_literals
import logging

import elasticsearch_dsl as dsl
from caliopen_storage.store.model import BaseIndexDocument
from ..parameters import Thread, Recipient

log = logging.getLogger(__name__)


class DiscussionIndexManager(object):

    """Manager for building discussions from index storage layer."""

    def __init__(self, user_id):
        self.index = user_id
        self.proxy = BaseIndexDocument.client()

    def _prepare_search(self, min_pi, max_pi):
        """Prepare a dsl.Search object on current index."""

        search = dsl.Search(using=self.proxy,
                            index=self.index,
                            doc_type='indexed_message')
        search = search.filter('range', **{'privacy_index': {'gte': min_pi}})
        search = search.filter('range', **{'privacy_index': {'lte': max_pi}})
        return search

    def __search_ids(self, limit, offset, min_pi, max_pi):
        """Search discussions ids as a bucket aggregation."""
        search = self._prepare_search(min_pi, max_pi)
        # Do bucket term aggregation
        agg = dsl.A('terms', field='thread_id', size=limit)
        search.aggs.bucket('discussions', agg)
        # XXX add sorting on message date_insert
        log.debug('Search is {}'.format(search.to_dict()))
        result = search.execute()
        if hasattr(result, 'aggregations'):
            # Something found
            buckets = result.aggregations.discussions.buckets
            return dict((x['key'], x['doc_count']) for x in buckets)
        log.debug('No result found on index {}'.format(self.index))
        return {}

    def __build_return(self, message):
        """Temporary build of output Thread return parameter."""
        discussion = Thread()
        discussion.user_id = self.index
        discussion.thread_id = message.thread_id
        discussion.date_update = message.date_insert
        discussion.text = message.text[200:]
        # XXX imperfect values
        discussion.privacy_index = message.privacy_index
        for rec in message.recipients:
            recipient = Recipient()
            recipient.address = rec['address']
            recipient.label = rec['label']
            recipient.type = rec['type']
            recipient.contact_id = rec['contact_id']
            recipient.protocol = rec['protocol']
            discussion.contacts.append(recipient)
        # XXX Missing values (at least other in parameter to fill)
        discussion.total_count = 0
        discussion.unread_count = 0

        return discussion

    def _build_discussion(self, discussion_id, doc_count, min_pi, max_pi):
        """Build a suitable representation of a discussion for output."""
        search = self._prepare_search(min_pi, max_pi)
        search.filter('terms', **{'thread_id': discussion_id})
        search.sort('-date_insert')
        search = search[0:1]
        result = search.execute()
        if not result.hits:
            # XXX what to do better if not found ?
            return {}
        message = result.hits[0]
        return self.__build_return(message)

    def list_discussions(self, limit=10, offset=0, min_pi=0, max_pi=0):
        """Build a list of limited number of discussions."""
        ids = self.__search_ids(limit, offset, min_pi, max_pi)
        discussions = []
        for id, count in ids.items():
            discuss = self._build_discussion(id, count, min_pi, max_pi)
            discussions.append(discuss)
        return discussions
