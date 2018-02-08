# -*- coding: utf-8 -*-
"""Caliopen functions for histogram informations from index."""
from __future__ import absolute_import, print_function, unicode_literals

from dateutil.parser import parse as parse_date
import elasticsearch_dsl as dsl

from caliopen_storage.helpers.connection import get_index_connection


class ParticipantHistogram(object):
    """Date histogram for a participant in user messages index."""

    def __init__(self, user, resolution='day'):
        """Instanciate a date histrogram for an user."""
        self.esclient = get_index_connection()
        self.user = user
        self.resolution = resolution

    def _format_results(self, results):
        """Return a list of date, value tuples."""
        return [(parse_date(x['key_as_string']),
                 x['doc_count']) for x in results]

    def _do_query(self, value, term):
        search = dsl.Search(using=self.esclient, index=self.user.shard_id,
                            doc_type='indexed_message')
        search.filter(user_id=self.user.user_id)
        term_query = dsl.Q('term', **{term: value})
        search = search.query('nested', path='participants',
                              score_mode='avg',
                              query=term_query)

        search.aggs.bucket('messages_with_value', 'date_histogram',
                           field='date', interval=self.resolution)

        r = search.execute()
        results = r.aggregations.messages_with_value['buckets']
        return self._format_results(results)

    def find_by_address(self, address):
        """Build a date histogram with a participant address."""
        return self._do_query(address, term='participants.address')

    def find_by_contact_id(self, contact_id):
        """Build a date histogram with a know contact."""
        return self._do_query(contact_id, term='participants.contact_id')
