# Import vcard

We can import one or more vcards from a file (using the caliopen cli).

## Import vcard

```
cd src/backend
caliopen import_vcard --help
caliopen -f configs/caliopen.yaml.template import_vcard -u <username> [-d <directory> | -f <file>]
```

```
docker-compose run cli import_vcard --help
docker-compose run cli import_vcard -u <username> [-d <directory> | -f <file>]
```

It's possible import vcards with a directory as a parameter.
Else, import vcards with a file as a parameter.
Also we can import vcards as a directory *and* a file. 

**NB**: Only file with extension *.vcf* or *.vcard* are imported.

## Working

* src/backend/main.py/main.caliopen_main/parsers

In vcard.py, we find functions `parse_vcard` and `parse_vcards` which read one or more vcards and return a NewContact or an array of NewContact. 

* src/backend/tools/py.CLI/calioepn_cli/commands

In import_vcard.py, function `import_vcard` create new contact, using parser, at a user (in parameter) with the file or the directory of vcards (in parameter). 
