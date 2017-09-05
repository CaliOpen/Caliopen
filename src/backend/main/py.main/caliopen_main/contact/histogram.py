# -*- coding: utf-8 -*-
"""Caliopen functions for histogram informations from index."""
from __future__ import absolute_import, print_function, unicode_literals

import elasticsearch_dsl as dsl


def participant_address_histogram(self, esclient, user_id, address,
                                  resolution='day'):
    """Build a date histogran for communication with a participant address."""
    search = dsl.Search(using=esclient, index=user_id,
                        doc_type='indexed_message')
    term_query = dsl.Q('term', **{'participants.address': address})
    search = search.query('nested', path='participants',
                          score_mode='avg',
                          query=term_query)

    search.aggs.bucket('messages_with_address', 'date_histogram',
                       field='date', interval=resolution)

    r = search.execute()
    results = r.aggregations.messages_with_adress['buckets']
    return results
