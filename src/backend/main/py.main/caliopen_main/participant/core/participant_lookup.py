# -*- coding: utf-8 -*-
"""Caliopen message object classes."""
from __future__ import absolute_import, print_function, unicode_literals

import hashlib
import logging
from datetime import datetime

from caliopen_storage.exception import NotFound
from caliopen_storage.core import BaseCore
from ..store.participant import ParticipantLookup as ModelParticipantLookup
from ..store.hash_lookup import HashLookup

log = logging.getLogger(__name__)


class ParticipantLookup(BaseCore):
    """Manage participant lookup for discussion consistency."""

    _model_class = ModelParticipantLookup
    _pkey_name = 'uri'

    @classmethod
    def update(cls, user, contact_id, participant):
        """
        update ParticipantLookup and HashLookup
        with new participant->contact relationship
        :param user:
        :param contact_id:
        :param participant:
        :return:
        """
        # TODO: complete or remove this method
        if not contact_id or not participant.address \
                or not participant.protocol:
            raise Exception("missing mandatory property to create lookup entry")
        date = datetime.utcnow()
        contact_key = "contact:" + contact_id
        participant_uri = participant.protocol + ":" + participant.address

    @classmethod
    def delete_contact_participant(cls, user, contact_id, participant):
        # TODO
        raise Exception("not implemented")

    @classmethod
    def delete_discussion_participant(cls, user, participants_hash,
                                      participants):
        # TODO
        raise Exception("not implemented")

    @classmethod
    def filter(cls, user, key):
        try:
            model = cls._model_class.filter(user_id=user.user_id,
                                            source=key)
            return cls(model)
        except NotFound:
            return None

    @classmethod
    def participants_from_uris(cls, user, uris, uris_hash):
        """
        - resolve uris to contact to build participants' set
        - compute participants_hash
        - create two way links :
                                uris<->uris_hash
                                uris<->participants_hash

        :param user:
        :param uris: a set() of uris formatted like 'scheme:path'
        :param uris_hash: the hash or uris' components
        :type uris: set
        :type uris_hash: string
        :return: participant
        """
        from caliopen_main.contact.core import ContactLookup

        participants = set()
        for uri in uris:
            contact = ContactLookup.get(user, uri.split(":", 1)[1])
            if contact:
                participants.add("contact:" + contact.contact_id)
            else:
                participants.add(uri)

        participants = list(participants)
        participants.sort()
        participants_hash = hashlib.sha256(''.join(participants)).hexdigest()

        date = datetime.utcnow()

        # store uris_hash -> participants_hash
        HashLookup.create(user_id=user.user_id,
                          kind="uris",
                          key=uris_hash,
                          value=participants_hash,
                          components=uris,
                          date_insert=date)
        # store participants_hash -> uris_hash
        HashLookup.create(user_id=user.user_id,
                          kind="participants",
                          key=participants_hash,
                          value=uris_hash,
                          components=participants,
                          date_insert=date)
        for uri in uris:
            # uri->uris_hash
            super(ParticipantLookup, cls).create(user_id=user.user_id,
                                                 uri=uri,
                                                 hash=uris_hash,
                                                 hash_components=uris,
                                                 date_insert=date)

        for participant in participants:
            # participant->participants_hash
            super(ParticipantLookup, cls).create(user_id=user.user_id,
                                                 uri=participant,
                                                 hash=participants_hash,
                                                 hash_components=participants,
                                                 date_insert=date)
        return {'components': participants, 'hash': participants_hash}
