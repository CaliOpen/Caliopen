# -*- coding: utf-8 -*-
"""Caliopen disccions index classes.

Discussions are not really indexed, they are result of messages aggregations.

So there is not direct document mapping, only helpers to find discussions
and build a suitable representation for displaying.

"""
from __future__ import absolute_import, print_function, unicode_literals
import logging

from elasticsearch_dsl import A
from caliopen_storage.store.model import BaseIndexDocument
from caliopen_main.message.store.message_index import IndexedMessage

log = logging.getLogger(__name__)


class DiscussionIndex(object):
    """Informations from index about a discussion."""

    total_count = 0
    unread_count = 0
    attachment_count = 0
    last_message = None

    def __init__(self, id):
        self.discussion_id = id


class DiscussionIndexManager(object):
    """Manager for building discussions from index storage layer."""

    def __init__(self, user):
        self.index = user.shard_id
        self.user_id = user.user_id
        self.proxy = BaseIndexDocument.client()

    def _prepare_search(self):
        """Prepare a dsl.Search object on current index."""
        search = IndexedMessage.search(using=self.proxy,
                                       index=self.index)
        search = search.filter('term', user_id=self.user_id)
        return search

    def __search_ids(self, limit, offset, min_pi, max_pi, min_il, max_il):
        """Search discussions ids as a bucket aggregation."""
        # TODO : search on participants_hash instead
        search = self._prepare_search(). \
            filter("range", importance_level={'gte': min_il, 'lte': max_il})
        # Do bucket term aggregation, sorted by last_message date
        size = offset + (limit * 2)
        agg = A('terms', field='discussion_id',
                order={'last_message': 'desc'}, size=size, shard_size=size)
        search.aggs.bucket('discussions', agg) \
            .metric('last_message', 'max', field='date_sort') \
            .bucket("unread", "filter", term={"is_unread": True})

        result = search.source(exclude=["*"]).execute()
        if hasattr(result, 'aggregations'):
            # Something found
            buckets = result.aggregations.discussions.buckets
            # XXX Ugly but don't find a way to paginate on bucket aggregation
            buckets = buckets[offset:offset + limit]
            total = result.aggregations.discussions.sum_other_doc_count
            # remove last_message for now as it doesn't have relevant attrs
            for discussion in buckets:
                del discussion["last_message"]
            return buckets, total
        log.debug('No result found on index {}'.format(self.index))
        return {}, 0

    def get_last_message(self, discussion_id, min_il, max_il, include_draft):
        """Get last message of a given discussion."""
        # TODO : une discussion_id
        search = self._prepare_search() \
            .filter("match", discussion_id=discussion_id) \
            .filter("range", importance_level={'gte': min_il, 'lte': max_il})

        if not include_draft:
            search = search.filter("match", is_draft=False)

        result = search.sort('-date_sort')[0:1].execute()
        if not result.hits:
            # XXX what to do better if not found ?
            return {}
        return result.hits[0]

    def list_discussions(self, limit=10, offset=0, min_pi=0, max_pi=0,
                         min_il=-10, max_il=10):
        """Build a list of limited number of discussions."""
        buckets, total = self.__search_ids(limit, offset, min_pi, max_pi,
                                           min_il,
                                           max_il)
        discussions = []
        for bucket in buckets:
            # TODO : les buckets seront des hash_participants, donc il faut créer la liste des discussion_id avant et itérer là-dessus
            message = self.get_last_message(bucket['key'],
                                            min_il, max_il,
                                            True)
            discussion = DiscussionIndex(bucket['key'])
            discussion.total_count = bucket['doc_count']
            discussion.unread_count = bucket['unread']['doc_count']
            discussion.last_message = message
            # XXX build others values from index
            discussions.append(discussion)
        # XXX total do not work completly, hack a bit
        return discussions, total + len(discussions)

    def message_belongs_to(self, discussion_id, message_id):
        """Search if a message belongs to a discussion"""

        msg = IndexedMessage.get(message_id, using=self.proxy, index=self.index)
        return str(msg.discussion_id) == str(discussion_id)

    def get_by_id(self, discussion_id, min_il=0, max_il=100):
        """Return a single discussion by discussion_id"""

        # TODO : search by multiple discussion_id because they are hashes now
        search = self._prepare_search() \
            .filter("match", discussion_id=discussion_id)
        search.aggs.bucket('discussions', A('terms', field='discussion_id')) \
            .bucket("unread", "filter", term={"is_unread": True})
        result = search.execute()
        if not result.hits or len(result.hits) < 1:
            return None

        message = self.get_last_message(discussion_id, min_il, max_il, True)
        discussion = DiscussionIndex(discussion_id)
        discussion.total_count = result.hits.total
        discussion.last_message = message
        discussion.unread_count = result.aggregations.discussions.buckets[
            0].unread.doc_count
        return discussion
