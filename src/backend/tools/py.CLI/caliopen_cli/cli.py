#!/usr/bin/env python

"""
Command Line Interface (CLI) for caliopen project


"""
import sys
import argparse
import logging

from caliopen_storage.config import Configuration
from caliopen_storage.helpers.connection import connect_storage
from caliopen_cli.commands import (shell, import_email,
                                   setup_storage, create_user,
                                   import_vcard, dump_model)

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

    sp_import_vcard = subparsers.add_parser('import_vcard', help='import vcard')
    sp_import_vcard.set_defaults(func=import_vcard)
    sp_import_vcard.add_argument('-u', dest='username', help='username')
    sp_import_vcard.add_argument('-d', dest='directory', help='directory')
    sp_import_vcard.add_argument('-f', dest='file_vcard', help='file')

    sp_setup_storage = subparsers.add_parser('setup',
        help='initialize the storage engine')
    sp_setup_storage.set_defaults(func=setup_storage)

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

    kwargs = parser.parse_args(args[1:])
    kwargs = vars(kwargs)

    config_uri = kwargs.pop('conffile')
    func = kwargs.pop('func')

    Configuration.load(config_uri, 'global')
    connect_storage()

    func(**kwargs)


if __name__ == '__main__':
    main()
