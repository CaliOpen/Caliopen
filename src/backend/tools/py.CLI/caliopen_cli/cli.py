#!/usr/bin/env python

"""
Command Line Interface (CLI) for caliopen project


"""
import sys
import argparse
import logging

from caliopen_storage.config import Configuration
from caliopen_storage.helpers.connection import connect_storage
from caliopen_cli.commands import (shell, import_email, setup, create_user,
                                   import_vcard, dump_model, dump_indexes,
                                   inject_email, basic_compute, migrate_index,
                                   import_reserved_names, resync_index,
                                   resync_shard_index, copy_model)

logging.basicConfig(level=logging.INFO)


def main(args=sys.argv):
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', dest='conffile', default='development.ini')
    subparsers = parser.add_subparsers(title="action")

    sp_import = subparsers.add_parser('import', help='import existing mailbox')
    sp_import.set_defaults(func=import_email)
    sp_import.add_argument('-f', dest='format', choices=['mbox', 'maildir'],
                           default='mbox')
    sp_import.add_argument('-p', dest='import_path')
    sp_import.add_argument('-e', dest='email')
    sp_import.add_argument('--contact-probability', dest='contact_probability',
                           default=0.8)
    sp_import.add_argument('-t', dest='to')

    sp_import_vcard = subparsers.add_parser('import_vcard',
                                            help='import vcard')
    sp_import_vcard.set_defaults(func=import_vcard)
    sp_import_vcard.add_argument('-u', dest='username', help='username')
    sp_import_vcard.add_argument('-d', dest='directory', help='directory')
    sp_import_vcard.add_argument('-f', dest='file_vcard', help='file')

    sp_setup = subparsers.add_parser('setup',
                                     help='initialize the storage engine')
    sp_setup.set_defaults(func=setup)

    sp_create_user = subparsers.add_parser('create_user',
                                           help='Create a new user')
    sp_create_user.set_defaults(func=create_user)
    sp_create_user.add_argument('-e', dest='email', help='user email')
    sp_create_user.add_argument('-p', dest='password', help='password')
    sp_create_user.add_argument('-g', dest='given_name',
                                help='user given name')
    sp_create_user.add_argument('-f', dest='family_name',
                                help='user family name')

    sp_shell = subparsers.add_parser('shell')
    sp_shell.set_defaults(func=shell)

    sp_dump = subparsers.add_parser('dump')
    sp_dump.set_defaults(func=dump_model)
    sp_dump.add_argument('-m', dest='model', help='model to dump')
    sp_dump.add_argument('-o', dest='output_path', help='output path')

    sp_copy = subparsers.add_parser('copy')
    sp_copy.set_defaults(func=copy_model)
    sp_copy.add_argument('-m', dest='model', help='model to dump')
    sp_copy.add_argument('--where', dest='where', help='where condition')
    sp_copy.add_argument('--fetch-size', dest='fetch_size', default=100)

    sp_dump_index = subparsers.add_parser('dump_index')
    sp_dump_index.set_defaults(func=dump_indexes)
    sp_dump_index.add_argument('-o', dest='output_path', help='output path')

    sp_migrate_index = subparsers.add_parser('migrate_index')
    sp_migrate_index.set_defaults(func=migrate_index)
    sp_migrate_index.add_argument('-s', dest='input_script',
                                  help='python script to execute on index')

    sp_inject = subparsers.add_parser('inject')
    sp_inject.set_defaults(func=inject_email)
    sp_inject.add_argument('-e', dest='email')
    sp_inject.add_argument('-r', dest='recipient')

    sp_compute = subparsers.add_parser('compute', help='Launch basic compute')
    sp_compute.set_defaults(func=basic_compute)
    sp_compute.add_argument('-u', dest='username', help='username')
    sp_compute.add_argument('-j', dest='job', help='job name')

    sp_reserved = subparsers.add_parser('reserved_names',
                                        help='Import reserved names list')
    sp_reserved.set_defaults(func=import_reserved_names)
    sp_reserved.add_argument('-i', dest='input_file', help='csv file')

    sp_resync = subparsers.add_parser('resync_index',
                                      help='Resync index for an user')
    sp_resync.set_defaults(func=resync_index)
    sp_resync.add_argument('-u', dest='user_name', help='User name')
    sp_resync.add_argument('-i', dest='user_id', help='User uuid')
    sp_resync.add_argument('--delete', dest='delete', action='store_true')

    sp_resync = subparsers.add_parser('resync_shard',
                                      help='Resync shard index')
    sp_resync.set_defaults(func=resync_shard_index)
    sp_resync.add_argument('-s', dest='shard_id', help='Shard id')
    sp_resync.add_argument('-o', dest='old_shard_id', help='Old shard id')
    kwargs = parser.parse_args(args[1:])
    kwargs = vars(kwargs)

    config_uri = kwargs.pop('conffile')
    func = kwargs.pop('func')

    Configuration.load(config_uri, 'global')
    connect_storage()

    func(**kwargs)


if __name__ == '__main__':
    main()
