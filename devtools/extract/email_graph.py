# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

import argparse
import logging
import re
import hashlib

from caliopen_storage.config import Configuration
from caliopen_data import ESProvider

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)
logging.basicConfig(level=logging.WARN)


def valid_uuid(uuid):
    """Validate uuid value using regex."""
    regex = re.compile('^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab]'
                       '[a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
    match = regex.match(uuid)
    return bool(match)


def anonymise_email(email):
    """Anonymise email field using an hash function."""
    # XXX do a better email formatting, even if it's supposed to be clean ...
    assert '@' in email, 'Invalid email {0}'.format(email)
    local_part, domain = email.split('@')
    hash_local = hashlib.sha256(local_part.encode('utf-8')).hexdigest()
    hash_domain = hashlib.sha256(domain.encode('utf-8')).hexdigest()
    return '{0}@{1}'.format(hash_local, hash_domain)


class EmailGraph(ESProvider):

    def _format_item(self, message):
        from_ = filter(lambda x: x['type'] == 'From',
                       message.participants)
        if from_:
            from_ = from_[0]
        else:
            log.warn('Message without from header')
            return
        to = filter(lambda x: x['type'] in ('To', 'Cc'), message.participants)
        type = 'plain'
        if 'privacy_features' in message:
            feat = message['privacy_features']
            if feat and feat['message_encrypted'] == 'True':
                type = 'crypt'
        if 'date' in message:
            date = message['date'].isoformat()
        else:
            date = ''
        for dest in to:
            try:
                hash1 = anonymise_email(from_['label'])
                hash2 = anonymise_email(dest['label'])
            except AssertionError as exc:
                log.error(exc)
                return
            received = 'true' if message['is_received'] else 'false'
            yield [hash1, hash2, type, date, received]


class Extractor(object):

    def __init__(self, config):
        self.shards = config.get('elasticsearch', {}).get('shards', [])
        self.provider = EmailGraph(config)

    def _get_indices(self):
        for idx in self.provider._store.indices.get('_all'):
            if valid_uuid(idx):
                yield idx

    def process(self, output, index=None):
        if index:
            indices = [index]
        else:
            indices = self._get_indices()
        with open(output, 'w') as output:
            for index in indices:
                cpt = 0
                log.info('Processing index %s' % index)
                search = IndexedMessage.search()
                self.provider.prepare(search, index=index,
                                      doc_type='indexed_message')
                for records in self.provider.next():
                    for record in records:
                        output.write('{0}\n'.format(';'.join(record)))
                        cpt += 1
                log.info('%d records processed' % cpt)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', dest='conffile')
    parser.add_argument('-o', dest='output')
    parser.add_argument('-i', dest='index')
    args = parser.parse_args()

    Configuration.load(args.conffile, 'global')
    from caliopen_main.message.store.message_index import IndexedMessage

    config = Configuration('global').configuration
    extractor = Extractor(config)
    extractor.process(args.output, args.index)
