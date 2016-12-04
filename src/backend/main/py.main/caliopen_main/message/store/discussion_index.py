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
from ..parameters import Thread

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

    def _fetch_ids(self, limit=10, offset=0, min_pi=0, max_pi=0,):
        """Fetch discussions id as an ``IndexedMessage`` aggregation."""
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
