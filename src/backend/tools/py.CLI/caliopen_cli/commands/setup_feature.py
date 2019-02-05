"""Create a user with a password in a Calipen instance."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

log = logging.getLogger(__name__)


# Privacy features definition
MESSAGE = {'mail_emitter_mx_reputation': {'type': 'string'},
           'mail_emitter_certificate': {'type': 'string'},
           'mail_agent': {'type': 'string'},
           'transport_signed': {'type': 'bool'},
           'message_signed': {'type': 'bool'},
           'message_signature_type': {'type': 'string'},
           'message_encrypted': {'type': 'bool'},
           'message_encryption_method': {'type': 'string'},
           'message_encryption_infos': {'type': 'string'},
           'is_spam': {'type': 'bool'},
           'spam_score': {'max': 100, 'min': 0, 'type': 'int'},
           'spam_method': {'type': 'string'},
           'ingress_socket_version': {'type': 'string'},
           'ingress_cipher': {'type': 'string'},
           'nb_external_hops': {'type': 'int'}}

DEVICE = {'browser_family': {'type': 'string'},
          'browser_version': {'type': 'string'},
          'os_family': {'type': 'string'},
          'device_type': {'type': 'string'},
          'detected_country': {'type': 'string'}}

CONTACT = {'message_day_total': {'type': 'int'},
           'message_day_avg': {'type': 'int'},
           'message_day_pstdev': {'type': 'int'},
           'address_or_phone': {'type': "bool"},
           'public_key_best_size': {'type': 'int'},
           'nb_protocols': {'type': 'int'}}


def setup_privacy_features():
    """Fill up table `feature` with default one."""
    from caliopen_main.common.core.feature import PrivacyFeature

    for name, desc in MESSAGE.items():
        PrivacyFeature.create(name=name, apply_to=['message'], **desc)

    for name, desc in DEVICE.items():
        PrivacyFeature.create(name=name, apply_to=['device'], **desc)

    for name, desc in CONTACT.items():
        PrivacyFeature.create(name=name, apply_to=['contact'], **desc)
