caliopen.cli
============

Caliopen Command Line Interface

Simple tool to provide some administration commands for caliopen project.

Define a ``caliopen`` command in your shell path.

# Usage

## Copy the sample caliopen.yaml.template file to roll your own configuration parameters::

    cp caliopen.yaml.template caliopen.yaml


## Setup the storage database::

    caliopen -f caliopen.yaml setup


## Create a user::

    caliopen create_user --help
    caliopen -f caliopen.yaml create_user -e imported@email -p password -g given_name -f family_name

## Import a mailbox ::

    caliopen import --help
    caliopen -f caliopen.yaml import -p ~/path_to_maildir -e  imported@email -f maildir

## Dump a model ::

    caliopen -f caliopen.yaml dump_model -m model_name -o output_path

## Import vcard ::

    Refer to `import vcard <doc/for-developers/vcard_doc.md>`_
