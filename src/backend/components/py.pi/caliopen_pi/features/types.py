# -*- coding: utf-8 -*-
"""Caliopen privacy features definition."""

from __future__ import unicode_literals, absolute_import

import logging

# Privacy features definition
FEATURES_0 = {'technic': [{'mail_emitter_mx_reputation': {'type': 'string'}},
                          {'mail_emitter_certificate': {'type': 'string'}},
                          {'mail_agent': {'type': 'string'}},
                          {'transport_signed': {'type': 'bool'}},
                          {'message_signed': {'type': 'bool'}},
                          {'message_signature_type': {'type': 'string'}},
                          {'message_encrypted': {'type': 'bool'}},
                          {'message_encryption_infos': {'type': 'string'}},
                          {'is_spam': {'type': 'bool'}},
                          {'spam_score': {'max': 100,
                                          'min': 0,
                                          'type': 'int'}},
                          {'spam_method': {'type': 'string'}},
                          {'ingress_socket_version': {'type': 'string'}},
                          {'ingress_cipher': {'type': 'string'}},
                          {'nb_external_hops': {'type': 'int'}}]}

FEATURE_DIMENSIONS = FEATURES_0.keys()

log = logging.getLogger(__name__)


def check_feature_bounding(value, feature):
    """Check that a feature fit between min and max value if apply."""
    if 'min' in feature and value < feature['min']:
        return False
    if 'max' in feature and value > feature['max']:
        return False
    return True


def check_feature(name, value):
    """Check that a feature have a correct value."""
    for dimension in FEATURE_DIMENSIONS:
        if name in FEATURES_0[dimension]:
            feature = FEATURES_0[dimension][name]
            break
    else:
        return False
    if feature['type'] == 'int':
        try:
            int(value)
        except ValueError:
            return False
        return check_feature_bounding(value, feature)

    elif feature['type'] == 'bool':
        return True if value in (True, False) else False


def marshall_feature(name, value):
    """Marshall a feature to it's type representation."""
    if not check_feature(name, value):
        raise ValueError('Invalid value {} for feature {}'.format(value, name))
    feature = FEATURES_0[name]
    if feature['type'] == 'int':
        return int(value)
    elif feature['type'] == 'bool':
        return True if value.lower().startswith('t') else False


def marshall_features(features):
    """Marshall a dict of features for suitable output."""
    res = {}
    for name, value in features.items():
        try:
            new_value = marshall_feature(name, value)
            res[name] = new_value
        except ValueError:
            log.warn('Feature {} with {} do not marshall'.format(name, value))
            pass
    return res


def unmarshall_features(features):
    """Unmarshall a dict of features suitable for storage."""
    res = {}
    for k, v in features.items():
        if not (v == '' or v is None):
            res[k] = str(v)
    return res
