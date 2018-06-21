# -*- coding: utf-8 -*-
"""Caliopen user message qualification logic."""
from __future__ import absolute_import, print_function, unicode_literals
import logging

from caliopen_storage.config import Configuration

from caliopen_pgp.keys import PublicKeyDiscoverer
from ..features import ContactFeature

log = logging.getLogger(__name__)


class ContactMessageQualifier(object):
    """Explore messages between an user and a contact to qualify."""

    def __init__(self, user):
        self.user = user

    def process(self, contact):
        """Qualification for a contact."""
        extractor = ContactFeature(self.user)
        pi, features = extractor.process(contact)
        # XXX for the moment apply features and pi
        if not contact.pi:
            current_pi = None
        else:
            current_pi = contact.pi.marshall_dict()
        new_pi = pi.serialize()
        new_pi.pop('date_update')
        current = {}
        patch = {}
        if pi.technic or pi.context or pi.comportment:
            current.update({'pi': current_pi})
            patch.update({'pi': new_pi})
        if contact.privacy_features:
            current_features = contact.privacy_features
        else:
            current_features = {}
        if current_features != features:
            current.update({'privacy_features': contact.privacy_features})
            patch.update({'privacy_features': features})
        if current and patch:
            patch.update({'current_state': current})
            log.info('Will patch with {0}'.format(patch))
            contact.apply_patch(patch, db=True)
            return True
        log.debug('No confidentiality update for contact')
        return False


class ContactEmailQualifier(object):
    """
    Process new or delete of an email for a contact.

    - will try to discover public keys
    - process for privacy features and PI compute

    """

    def __init__(self, user):
        """Create a new instance of an contact email qualifier."""
        self.user = user
        conf = Configuration('global').configuration
        self.key_disco = PublicKeyDiscoverer(conf)

    def _process_new_keys(self, contact, keys):
        known_fingerprints = [x.fingerprint for x in contact.public_keys]
        new_keys = []
        for new_key in keys:
            if new_key.fingerprint not in known_fingerprints:
                if not new_key.is_expired:
                    new_keys.append(new_key)
        if new_keys:
            ids = [x.fingerprint for x in new_keys]
            log.info('Found new keys {0} for contact'.format(ids))
            # XXX for the moment
            return new_keys

        if 'valid_public_keys' not in contact.privacy_features.keys():
            contact.privacy_features['valid_public_keys'] = True
            #  - Si le contact a une clé publique connue, le PIᵗ
            # gagne 30 points (20 points si la clé fait moins
            # de 2048 bits, 15 points si elle fait 1024 bits ou moins).
            max_size = max([x.size] for x in new_keys)
            if max_size <= 1024:
                contact.pi.technic = contact.pi.technic + 15
            elif max_size <= 2048:
                contact.pi.technic = contact.pi.technic + 20
            elif max_size > 2048:
                contact.pi.technic = contact.pi.technic + 30

            co_boost = 5 * len(new_keys)
            contact.pi.comportment = contact.pi.comportment + co_boost
            contact.save()

    def create_new_email(self, contact, email):
        """Add a new email for a contact."""
        found_keys = self.key_disco.search_email(email)
        if found_keys:
            log.info('Found keys for email {0}: {1}'.format(email, found_keys))
            self._process_new_keys(contact, found_keys)
