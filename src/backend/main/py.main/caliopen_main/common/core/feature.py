# -*- coding: utf-8 -*-
"""Caliopen public key core classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
from caliopen_storage.core import BaseCore
from caliopen_main.common.store import PrivacyFeature as ModelFeature

log = logging.getLogger(__name__)


FEATURES = {}


def init_features():
    """Initialize all features."""
    for obj in PrivacyFeature._model_class.objects.all():
        FEATURES[obj.name] = PrivacyFeature(obj)


def find_feature(name):
    """Feature lookup by name."""
    return FEATURES[name]


class PrivacyFeature(BaseCore):
    """Privacy feature core class."""

    _model_class = ModelFeature
    _pkey_name = 'name'

    @classmethod
    def by_type(cls, type):
        """Return list of privacy feature that apply to an object type."""
        for model in cls._model_class.objects.all():
            if type in model.apply_for:
                yield cls(model)

    def check_value(self, value):
        """Validate a value for a feature."""
        if self.type == 'int':
            try:
                int(value)
            except ValueError:
                return False
            return self.check_value_bounding(value)

        elif self.type == 'bool':
            return True if value in (True, False) else False
        elif self.type == 'string':
            return True
        raise Exception("Invalid feature type {0}".format(self.type))

    def check_feature_bounding(self, value):
        """Check that a feature fit between min and max value if apply."""
        if self.min is not None and value < self.min:
            return False
        if self.max is not None and value > self.max:
            return False
        return True


def unmarshal_feature(name, value):
    """Unmarshal a feature to it's type representation."""
    feature = find_feature(name)
    if not feature:
        log.warn('Unknow feature %s' % name)
        return None

    if not feature.check_value(value):
        raise ValueError('Invalid value {} for feature {}'.format(value, name))
    if feature.type == 'int':
        return int(value)
    elif feature.type == 'bool':
        return True if value.lower().startswith('t') else False
    elif feature.type == 'string':
        if value == 'None':
            return None
        return value


def unmarshal_features(features):
    """Unmarshal a dict of features for suitable output."""
    res = {}
    for name, value in features.items():
        try:
            new_value = unmarshal_feature(name, value)
            res[name] = new_value
        except ValueError:
            log.warn('Feature {} with {} do not marshall'.format(name, value))
            pass
    return res


def marshal_features(features):
    """Unmarshall a dict of features suitable for storage."""
    res = {}
    for k, v in features.items():
        if not (v == '' or v is None):
            res[k] = str(v)
    return res
