# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import hashlib
import logging

from datetime import datetime

from caliopen_storage.exception import NotFound
from caliopen_storage.core import BaseCore
from caliopen_main.participant.store import HashLookup as ModelHashLookup, \
    ParticipantHash as ModelParticipantHash

log = logging.getLogger(__name__)


class HashLookup(BaseCore):
    _model_class = ModelHashLookup
    _pkey_name = 'hash'


class ParticipantHash(BaseCore):
    _model_class = ModelParticipantHash
    _pkey_name = 'value'


def hash_participants_uri(participants):
    """
    Create hash from a collection of Participant

    :param participants: a collection of Participant
    :return: sorted collection of participants' URI + hash of this collection

    hash is computed from a set of URIs which are strings modeled as
    'participant.protocol:participant.address'
    """
    URIs = set()
    for participant in participants:
        if not participant.address or not participant.protocol:
            raise Exception("missing mandatory property in participant")
        uri = participant.protocol + ":" + participant.address.lower()
        URIs.add(uri)

    URIs = list(URIs)
    URIs.sort()
    hash = hashlib.sha256(''.join(URIs).encode('utf-8)')).hexdigest()
    return {'uris': URIs, 'hash': hash}


def participants_from_uris(user, uris, uris_hash):
    """
    - resolve uris to contact to build participants' set
    - compute participants_hash
    - create two ways links :
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
        try:
            contact = ContactLookup.get(user, uri.split(":", 1)[1])
            if contact:
                participants.add("contact:" + contact.contact_id)
            else:
                participants.add(uri)
        except NotFound:
            participants.add(uri)

    participants = list(participants)
    participants.sort()
    participants_hash = hashlib.sha256(''.join(participants).encode('utf-8)')).hexdigest()

    date = datetime.utcnow()

    # store uris_hash -> participants_hash
    ParticipantHash.create(user_id=user.user_id,
                           kind="uris",
                           key=uris_hash,
                           value=participants_hash,
                           components=uris,
                           date_insert=date)
    # store participants_hash -> uris_hash
    ParticipantHash.create(user_id=user.user_id,
                           kind="participants",
                           key=participants_hash,
                           value=uris_hash,
                           components=participants,
                           date_insert=date)
    for uri in uris:
        # uri->uris_hash
        HashLookup.create(user_id=user.user_id,
                          uri=uri,
                          hash=uris_hash,
                          hash_components=uris,
                          date_insert=date)

    return {'components': participants, 'hash': participants_hash}
