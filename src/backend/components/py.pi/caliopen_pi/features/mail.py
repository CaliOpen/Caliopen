# -*- coding: utf-8 -*-
"""Caliopen mail message privacy features extraction methods."""
from __future__ import absolute_import, print_function, unicode_literals

import logging

import pgpy

from caliopen_main.pi.parameters import PIParameter
from .spam import SpamScorer
from .types import unmarshall_features
from .ingress_path import get_ingress_features

log = logging.getLogger(__name__)

TLS_VERSION_PI = {
    'tlsv1/sslv3': 2,
    'tls1': 7,
    'tlsv1': 7,
    'tls12': 10,
}


class InboundMailFeature(object):
    """Process a parsed mail message and extract available privacy features."""

    _features = {
        'mail_emitter_mx_reputation': None,
        'mail_emitter_certificate': None,
        'transport_signed': False,
        'message_signed': False,
        'message_signature_type': None,
        'message_signer': None,
        'message_encrypted': False,
        'message_encryption_infos': None,
        'mail_agent': None,
        'spam_score': 0,
        'spam_method': None,
        'is_spam': False,
        'ingress_socket_version': None,
        'ingress_cipher': None,
        'ingress_server': None,
        'nb_external_hops': 0,
    }

    def __init__(self, message, config):
        """Get a ``MailMessage`` instance and extract privacy features."""
        self.message = message
        self.config = config

    def is_blacklist_mx(self, mx):
        """MX is blacklisted."""
        blacklisted = self.config.get('blacklistes.mx')
        if not blacklisted:
            return False
        if mx in blacklisted:
            return True
        return False

    def is_whitelist_mx(self, mx):
        """MX is whitelisted."""
        whitelistes = self.config.get('whitelistes.mx')
        if not whitelistes:
            return False
        if mx in whitelistes:
            return True
        return False

    @property
    def internal_domains(self):
        """Get internal hosts from configuration."""
        domains = self.config.get('internal_domains')
        return domains if domains else []

    def emitter_reputation(self, mx):
        """Return features about emitter."""
        if self.is_blacklist_mx(mx):
            return 'blacklisted'
        if self.is_whitelist_mx(mx):
            return 'whitelisted'
        return 'unknown'

    def emitter_certificate(self):
        """Get the certificate from emitter."""
        return None

    @property
    def mail_agent(self):
        """Get the mailer used for this message."""
        # XXX normalize better and more ?
        return self.message.mail.get('X-Mailer', '').lower()

    @property
    def transport_signature(self):
        """Get the transport signature if any."""
        return self.message.mail.get('DKIM-Signature')

    @property
    def spam_informations(self):
        """Return a global spam_score and related features."""
        spam = SpamScorer(self.message.mail)
        return {'spam_score': spam.score,
                'spam_method': spam.method,
                'is_spam': spam.is_spam}

    def get_signature_informations(self):
        """Get message signature features."""
        signed_parts = [x for x in self.message.attachments
                        if 'pgp-sign' in x.content_type]
        if not signed_parts:
            return {}
        sign = pgpy.PGPSignature()
        features = {'message_signed': True,
                    'message_signature_type': 'PGP'}
        try:
            sign.parse(signed_parts[0].data)
            features.update({'message_signer': sign.signer})
        except Exception as exc:
            log.error('Unable to parse pgp signature {}'.format(exc))
        return features

    def get_encryption_informations(self):
        """Get message encryption features."""
        encrypted_parts = [x for x in self.message.attachments
                           if 'pgp-encrypt' in x.content_type]
        is_encrypted = True if encrypted_parts else False
        return {'message_encrypted': is_encrypted}

    def _get_features(self):
        """Extract privacy features."""
        features = self._features.copy()
        received = self.message.headers.get('Received', [])
        features.update(get_ingress_features(received, self.internal_domains))
        mx = features.get('ingress_server')
        reputation = None if not mx else self.emitter_reputation(mx)
        features['mail_emitter_mx_reputation'] = reputation
        features['mail_emitter_certificate'] = self.emitter_certificate()
        features['mail_agent'] = self.mail_agent
        features.update(self.get_signature_informations())
        features.update(self.get_encryption_informations())
        features.update(self.spam_informations)

        if self.transport_signature:
            features.update({'transport_signed': True})
        return features

    def _compute_pi(self, participants, features):
        """Compute Privacy Indexes for a message."""
        log.info('PI features {}'.format(features))
        pi_cx = {}   # Contextual privacy index
        pi_co = {}   # Comportemental privacy index
        pi_t = {}   # Technical privacy index
        reput = features.get('mail_emitter_mx_reputation')
        if reput == 'whitelisted':
            pi_cx['reputation_whitelist'] = 20
        elif reput == 'unknown':
            pi_cx['reputation_unknow'] = 10
        known_contacts = []
        known_public_key = 0
        for part, contact in participants:
            if contact:
                known_contacts.append(contact)
                if contact.public_key:
                    known_public_key += 1
        if len(participants) == len(known_contacts):
            # XXX
            # - Si tous les contacts sont déjà connus le PIᶜˣ
            # augmente de la valeur du PIᶜᵒ le plus bas des PIᶜᵒ des contacts.
            if known_public_key == len(known_contacts):
                pi_co['contact_pubkey'] = 20
        ext_hops = features.get('nb_external_hops', 0)
        if ext_hops <= 1:
            tls = features.get('ingress_socket_version')
            if tls:
                if tls not in TLS_VERSION_PI:
                    log.warn('Unknown TLS version {}'.format(tls))
                else:
                    pi_t += TLS_VERSION_PI[tls]
        if features.get('mail_emitter_certificate'):
            pi_t['emitter_certificate'] = 10
        if features.get('transport_signed'):
            pi_t['transport_signed'] = 10
        if features.get('message_encrypted'):
            pi_t['encrypted'] = 30
        log.info('PI compute t:{} cx:{} co:{}'.format(pi_t, pi_cx, pi_co))
        return PIParameter({'technic': sum(pi_t.values()),
                            'context': sum(pi_cx.values()),
                            'comportment': sum(pi_co.values()),
                            'version': 0})

    def process(self, message, participants):
        """
        Process the message for privacy features and PI compute.

        :param message: a message parameter that will be updated with PI
        :ptype message: NewMessage
        :param participants: an array of participant with related Contact
        :ptype participants: list(Participant, Contact)
        """
        features = self._get_features()
        message.pi = self._compute_pi(participants, features)
        message.privacy_features = unmarshall_features(features)
