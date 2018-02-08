# -*- coding: utf-8 -*-
"""Caliopen mail message privacy features extraction methods."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

from caliopen_main.pi.parameters import PIParameter
from .histogram import ParticipantHistogram
from .types import unmarshall_features


log = logging.getLogger(__name__)

MESSAGE_TOTAL_THRESHOLD = 10
NB_PROTOCOLS_THRESHOLD = 3


def pstdev(avg, data):
    """Population standard deviation."""
    ss = sum((x - avg) ** 2 for x in data)
    return (ss / float(len(data))) ** 0.5


class ContactFeature(object):
    """Process a contact to extract its privacy features."""

    _features = {
        'message_day_total': 0,
        'message_day_avg': 0,
        'message_day_pstdev': 0,
        'public_key_best_size': 0,
        'address_or_phone': False,
        'nb_protocols': 0
    }

    def __init__(self, user, conf=None):
        self.user = user
        self.conf = conf

    def _compute_histogram(self, email):
        """Get an histogram for a contact email and compute basic infos."""
        histo = ParticipantHistogram(self.user, 'day')
        data = histo.find_by_address(email)
        log.info('Got email {0} histogram result {1}'.format(email, data))
        if data:
            values = [x[1] for x in data]
            total = sum(values)
            avg = total / float(len(values))
            return (total, avg, pstdev(avg, values))
        return (0.0, 0.0, 0.0)

    def _get_histogram(self, contact):
        """Get privacy features related to message histograms."""
        histograms = [self._compute_histogram(x.address)
                      for x in contact.emails]
        if histograms:
            best = max(histograms)
            return {'message_day_total': best[0],
                    'message_day_avg': best[1],
                    'message_day_pstdev': best[2]}
        return {}

    def _get_technical(self, contact):
        """Get technical features for a contact."""
        features = {}
        if contact.public_keys:
            max_size = max([x.size for x in contact.public_keys])
            if max_size:
                features.update({'public_key_best_size': max_size})
        return features

    def _compute_pi(self, contact, features):
        pi_t = 0
        pi_cx = 0
        pi_co = 0
        if 'public_key_best_size' in features:
            size = features['public_key_best_size']
            if size < 2048:
                pi_t += 15
            elif size > 2048:
                pi_t += 30
            else:
                pi_t += 20

        if 'message_day_total' in features:
            if features['message_day_total'] >= MESSAGE_TOTAL_THRESHOLD:
                pi_cx += 10

        if contact.addresses or contact.phones:
            features.update({'address_or_phone': True})
            pi_co += 10

        nb_protocols = len(contact.emails) + len(contact.phones)
        if nb_protocols >= NB_PROTOCOLS_THRESHOLD:
            features.update({'nb_protocols': nb_protocols})
            pi_co += 5

        return PIParameter({'technic': pi_t,
                            'comportment': pi_co,
                            'context': pi_cx,
                            'version': 0})

    def process(self, contact):
        """Process a contact to extract all privacy features."""
        features = self._get_histogram(contact)
        features.update(self._get_technical(contact))
        log.info('Contact {0} have features {1}'.
                 format(contact.contact_id, features))
        pi = self._compute_pi(contact, features)
        return pi, unmarshall_features(features)
