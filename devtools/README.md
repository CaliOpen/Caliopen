# CaliOpen development tools

Here you will find tools for CaliOpen development. There is many possibles
scenarios for setup of an environment development, depending on what you
want to do.

_For complete documentation, see the [doc/for-developers](../doc/for-developers) directory._

# Development scenarios

## Golang development

Please refer to [this documentation](https://github.com/CaliOpen/Caliopen/doc/for-developers/goland-dev.md)
for specific informations related to golang development.

## Client development

**Requirements:**

* You need the API running under vagrant/docker/manual install, cf. Environment setup. Obviously, you don't need to run frontend service.
* You need [node](https://nodejs.org/en/) v6 or later
* You need [yarn](https://yarnpkg.com/en/docs/install) to manage dependencies.

Then develop locally using your normal practices:

```
cd src/frontend/web_application
yarn install
npm start
```

It's a bit long to compile. Notice that running client on both vagrant and locally will not work
since it uses the same port.

> You can develop using the box, the code will be immediatly updated. The first compilation is still
> long, up to 1 min. You can use tail to see when it's ready:

```
tail -f src/frontend/web_application/kotatsu.log
```

> [kotatsu] Serving your app on port 4000... //<- ready

## Api development

at least 2 scenarios:

- running the vagrant box, it's a pserve with --reload option started
  in it, so your changes will immediatly update the api code.

- running in a python virtual environment with storage services running locally

## Backend development

It's better to run all storage services locally and develop inside a python virtual
environment for such development, at the moment.

# Environment setup

## Setup vagrant box

You need to have [virtualbox](https://www.virtualbox.org/) and [vagrant](https://vagrantup.com) installed on your machine.

Just run inside this directory a ``vagrant up`` command, and you will have a debian
VM running these services visible on your guest machine:

- 4025 for LMTP (ingest mail)
- 6543 for ReST API
- 4000 for the web client

## Setup docker compose stack

you need to have [docker](https://docs.docker.com/engine/installation/) and [docker compose](https://docs.docker.com/compose/) installed on your machine.

Services available in the docker compose stack are:

- redis
- elasticsearch
- cassandra
- object store (minio for now)
- caliopen's api (api)
- caliopen's frontend (frontend)
- caliopen's lmtp service (broker)

You can start storage services using these commands:

```
cd devtools
docker-compose build
docker-compose up -d redis cassandra elasticsearch
```
(wait few seconds for cassandra to warm-up)

Then you can setup storage, create an user and import email using caliopen cli tool:
```
cd devtools
docker-compose run cli setup
docker-compose run cli create_user -e dev -p 123456
docker-compose run cli import -e dev@caliopen.local -f mbox -p devtools/fixtures/mbox/dev@caliopen.local
```

**NB** : data are persisted after containers are stopped, even after beeing destroyed.

Finally start the api and the frontend:

```
cd devtools
docker-compose up -d api
docker-compose up -d frontend
```

If you want to send/receive emails, start email broker:
```
cd devtools
docker-compose up -d broker
```
**NB** : for now, outgoing emails are caught by a local smtp server for testing purpose.

You will have a Caliopen instance filled with data, accessible from your browser on localhost:4000.  
You could check outgoing emails by pointing your browser at localhost:8888.  

### Fresh install

To reset containers and data:

```
docker-compose stop

# remove containers :
docker-compose rm

# remove volumes created by containers :
docker volume rm devtools_db devtools_index devtools_store
```

### Troubleshoutings

**elasticsearch won't start**:

According to [this issue](https://github.com/docker-library/elasticsearch/issues/111), you might solve it with this command on the host:

```
sysctl -w vm.max_map_count=262144

# make it permanent:
echo "vm.max_map_count = 262144" > sudo tee /etc/sysctl.d/vm.caliopen.conf
```

# Staging scenarios

Please refer to [ansible-poc][ansible-poc] project, this will prepare your host and start Caliopen
in stable mode (latest release).

Under the hood it will run docker-compose with production config:

```bash
docker-compose -f docker-compose.staging.yml up -d frontend broker
```

[ansible-poc]: https://github.com/CaliOpen/ansible-poc
