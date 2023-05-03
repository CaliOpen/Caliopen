# -*- coding: utf-8 -*-

# migrate_index will load the script at the given path
# this script must implement a class named "IndexMigrator"
# with a method "run(elasticsearch_client)"

from __future__ import absolute_import, print_function, unicode_literals

import logging
import imp
import os

from elasticsearch import Elasticsearch
from caliopen_storage.config import Configuration

log = logging.getLogger(__name__)


def migrate_index(**kwargs):
    raise Exception("This script cannot be execute in this current state; it's based on versionned indices which is not used anymore, the version was in the name. So it breaks the migration mechinism. You can use sync_indices command instead to sync settings & mapping, it's almost like a migration except it uses latest version of the mapping.")

    # TODO eventually reintroduce version but in `_meta` in mapping configuration.
    # Also remove url in params since it's already set in client and
    # any way to have an interface for Migrators?
    # Migrator = load_from_file(kwargs["input_script"])
    # if Migrator:
    #     url = Configuration('global').get('elasticsearch.url')
    #     mappings_version = Configuration('global').get(
    #         'elasticsearch.mappings_version')
    #     if url and mappings_version:
    #         client = Elasticsearch(url)
    #         migration = Migrator(client=client,
    #                              mappings_version=mappings_version,
    #                              url=url)
    #         migration.run()


def load_from_file(filepath):
    c = None
    expected_class = 'IndexMigrator'

    mod_name, file_ext = os.path.splitext(os.path.split(filepath)[-1])

    if file_ext.lower() == '.py':
        py_mod = imp.load_source(mod_name, filepath)

    if hasattr(py_mod, expected_class):
        c = getattr(py_mod, expected_class)

    return c
