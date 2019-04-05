# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import hashlib
import logging

log = logging.getLogger(__name__)


def hash_participants_ids(participants):
    """
    Create hash from a collection of Participant
    if a participant_id is missing, then hash is not computed

    :param participants: a collection of Participant
    :return: sorted collection of participants' ids + hash of this collection
    """
    ids = set()
    for participant in participants:
        if participant.participant_id:
            ids.add(str(participant.participant_id))
        else:
            raise Exception("missing a participant_id, can't compute hash")
    ids = list(ids)
    ids.sort()
    hash = hashlib.sha256(''.join(ids)).hexdigest()
    return {'ids': ids, 'hash': hash}
