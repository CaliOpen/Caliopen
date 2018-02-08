# -*- coding: utf-8 -*-
"""new user related logic"""

from __future__ import absolute_import, print_function, unicode_literals

import logging
import datetime
import pytz

from caliopen_storage.config import Configuration
from elasticsearch import Elasticsearch
from caliopen_storage.core import core_registry
from caliopen_main.user.objects.settings import Settings as ObjectSettings

log = logging.getLogger(__name__)


def setup_index(user):
    """Creates user index and setups mappings."""
    url = Configuration('global').get('elasticsearch.url')
    client = Elasticsearch(url)

    shard_id = user.shard_id
    # Creates a versioned index with our custom analyzers, tokenizers, etc.
    m_version = Configuration('global').get('elasticsearch.mappings_version')
    if m_version == "":
        raise Exception('Invalid mapping version for shard {0}'.
                        format(shard_id))

    alias_name = shard_id
    index_name = "{0}_{1}".format(shard_id, m_version)

    if client.indices.exists(index_name):
        log.debug("Index for shard {0} already exists".format(shard_id))
        return
    try:
        log.info('Creating index {0} for shard {1}'.
                 format(index_name, shard_id))
        client.indices.create(
            index=index_name,
            body={
                "settings": {
                    "analysis": {
                        "analyzer": {
                            "text_analyzer": {
                                "type": "custom",
                                "tokenizer": "lowercase",
                                "filter": [
                                    "ascii_folding"
                                ]
                            },
                            "email_analyzer": {
                                "type": "custom",
                                "tokenizer": "email_tokenizer",
                                "filter": [
                                    "ascii_folding"
                                ]
                            }
                        },
                        "filter": {
                            "ascii_folding": {
                                "type": "asciifolding",
                                "preserve_original": True
                            }
                        },
                        "tokenizer": {
                            "email_tokenizer": {
                                "type": "ngram",
                                "min_gram": 3,
                                "max_gram": 25
                            }
                        }
                    }
                }
            })
    except Exception as exc:
        log.warn("failed to create index {} : {}".format(index_name, exc))
        return

    # Points an alias to the underlying user's index
    try:
        client.indices.put_alias(index=index_name, name=alias_name)
    except Exception as exc:
        raise Exception("failed to create alias {0} : {1}".
                        format(alias_name, exc))

    # PUT mappings for each type, if any
    for name, kls in core_registry.items():
        if hasattr(kls, "_index_class") and \
                hasattr(kls._model_class, 'user_id'):
            idx_kls = kls._index_class()
            if hasattr(idx_kls, "build_mapping"):
                log.debug('Init index mapping for {}'.format(idx_kls))
                idx_kls.create_mapping(index_name)


def setup_system_tags(user):
    """Create system tags."""
    # TODO: translate tags'name to user's preferred language
    default_tags = Configuration('global').get('system.default_tags')
    for tag in default_tags:
        tag['type'] = 'system'
        tag['date_insert'] = datetime.datetime.now(tz=pytz.utc)
        tag['label'] = tag.get('label', tag['name'])
        from .user import Tag
        Tag.create(user, **tag)


def setup_settings(user, settings):
    """Create settings related to user."""
    # XXX set correct values

    settings = {
        'user_id': user.user_id,
        'default_locale': settings.default_locale,
        'message_display_format': settings.message_display_format,
        'contact_display_order': settings.contact_display_order,
        'contact_display_format': settings.contact_display_format,
        'notification_enabled': settings.notification_enabled,
        'notification_message_preview':
            settings.notification_message_preview,
        'notification_sound_enabled':
            settings.notification_sound_enabled,
        'notification_delay_disappear':
            settings.notification_delay_disappear,
    }

    obj = ObjectSettings(user)
    obj.unmarshall_dict(settings)
    obj.marshall_db()
    obj.save_db()
    return True
