# -*- coding: utf-8 -*-
"""Caliopen core thread related classes."""
from __future__ import absolute_import, print_function, unicode_literals

import logging
import uuid
from datetime import datetime

from caliopen_storage.exception import NotFound
from caliopen_storage.core import BaseUserCore
from caliopen_storage.parameters import ReturnCoreObject

from ...user.core import Contact

from ..store import  \
    (ThreadExternalLookup as ModelExternalLookup,
     ThreadRecipientLookup as ModelRecipientLookup,
     ThreadMessageLookup as ModelMessageLookup,
     Thread as ModelThread,
     ThreadCounter as ModelCounter,
     DiscussionIndexManager as DIM)
from ..parameters import Thread as ThreadParam, Recipient


log = logging.getLogger(__name__)


def count_attachment(message):
    """Return number of attachment in message."""
    cpt = 0
    if message.parts:
        for p in message.parts:
            if p.filename:
                cpt += 1
    return cpt


class ThreadExternalLookup(BaseUserCore):

    """Lookup thread by external id (facebook, gmail, ...)."""

    _model_class = ModelExternalLookup
    _pkey_name = 'external_id'


class ThreadRecipientLookup(BaseUserCore):

    """Lookup thread for a recipient, only one."""

    _model_class = ModelRecipientLookup
    _pkey_name = 'recipient_name'


class ThreadMessageLookup(BaseUserCore):

    """Lookup thread by external message_id."""

    _model_class = ModelMessageLookup
    _pkey_name = 'external_message_id'


class Counter(BaseUserCore):

    """Counters related to thread."""

    _model_class = ModelCounter

    @classmethod
    def get(cls, user_id, thread_id):
        """Get Counter core object related to a thread_id."""
        try:
            obj = cls._model_class.get(user_id=user_id,
                                       thread_id=thread_id)
            return cls(obj)
        except Exception:
            return None


class MainViewReturn(object):

    """Build main view return structure from index messages."""

    def _build_discussion(self, user_id, message):
        """Temporary build of output Thread return parameter."""
        discussion = ThreadParam()
        discussion.user_id = user_id
        discussion.thread_id = message.thread_id
        discussion.date_update = message.date_insert
        discussion.text = message.text[200:]
        # XXX imperfect values
        discussion.privacy_index = message.privacy_index
        for rec in message.recipients:
            recipient = Recipient()
            recipient.address = rec['address']
            recipient.label = rec['label']
            recipient.type = rec['type']
            recipient.contact_id = rec['contact_id']
            recipient.protocol = rec['protocol']
            discussion.contacts.append(recipient)
        # XXX Missing values (at least other in parameter to fill)
        discussion.total_count = 0
        discussion.unread_count = 0
        return discussion.serialize()

    def build_response(self, user_id, messages, count):
        discussions = [self._build_discussion(user_id, x) for x in messages]
        return {'discussions': discussions, 'total': count}


class Thread(BaseUserCore):

    """Thread core object."""

    _model_class = ModelThread

    _pkey_name = 'thread_id'
    _counter = None

    @classmethod
    def create_from_message(cls, user, message):
        new_id = uuid.uuid4()
        kwargs = {'thread_id': new_id,
                  'date_insert': datetime.utcnow(),
                  'privacy_index': message.privacy_index,
                  'importance_level': message.importance_level,
                  'text': message.text[:200],
                  }
        thread = cls.create(user, **kwargs)
        log.debug('Created thread {}' .format(thread.thread_id))
        counters = Counter.create(user, thread_id=thread.thread_id)
        counters.model.total_count = 1
        counters.model.unread_count = 1
        counters.model.attachment_count = count_attachment(message)
        counters.save()
        log.debug('Created thread counters {}'.format(counters))
        return thread

    def update_from_message(self, message):
        # XXX concurrency will have to be considered correctly
        if message.privacy_index < self.privacy_index:
            # XXX : use min value, is it correct ?
            self.privacy_index = message.privacy_index
            self.save()

        # Update counters
        counters = Counter.get(self.user_id, self.thread_id)
        counters.model.total_count += 1
        counters.model.unread_count += 1
        nb_attachments = count_attachment(message)
        if nb_attachments:
            counters.model.attachment_count += nb_attachments
        counters.save()
        return True

    @classmethod
    def by_external_id(cls, user, external_thread_id):
        try:
            lookup = ThreadExternalLookup.get(user, external_thread_id)
        except NotFound:
            return None
        return cls.get(user, lookup.thread_id)

    @classmethod
    def by_recipient_name(cls, user, recipient_name):
        try:
            lookup = ThreadRecipientLookup.get(user, recipient_name)
        except NotFound:
            return None
        return cls.get(user, lookup.thread_id)

    @classmethod
    def expand_contacts(self, user, contacts):
        results = []
        for contact in contacts:
            results.append(Contact.get(user, contact['contact_id']))
        return results

    @classmethod
    def expand_tags(self, user, tags):
        if not tags:
            return []
        user_tags = dict((x.label, x) for x in user.tags)
        results = []
        for tag in tags:
            if tag in user_tags:
                results.append(user_tags[tag])
            else:
                log.warn('Unknow user tag {}'.format(tag))
        return results

    @property
    def counters(self):
        """return ``Counter`` core related to threads."""
        # XXX need of a reify decorator ?
        if not self._counter:
            self._counter = Counter.get(self.user_id, self.thread_id)
        return self._counter

    @property
    def total_count(self):
        """Total messages counter."""
        return self.counters.total_count

    @property
    def unread_count(self):
        """Unread messages counter."""
        return self.counters.unread_count

    @property
    def attachment_count(self):
        """Total number of attachments."""
        return self.counters.attachment_count

    @classmethod
    def main_view(cls, user, min_pi, max_pi, limit, offset):
        """Build the main view results."""
        # XXX use of correct pagination and correct datasource (index)
        dim = DIM(user.user_id)
        messages, total = dim.list_discussions(limit=limit, offset=offset,
                                               min_pi=min_pi, max_pi=max_pi)
        response = MainViewReturn()
        return response.build_response(user.user_id, messages, total)


class ReturnThread(ReturnCoreObject):

    _core_class = Thread
    _return_class = ThreadParam
