#!/bin/bash

sudo sysctl -w vm.max_map_count=262144
docker-compose build --pull

set -e

# init db & co
docker-compose run cli -h
docker-compose up -d objectstore
sleep 60
docker-compose run cli setup
docker-compose run cli create_user -e admin -p 123456
docker-compose run cli create_user -e dev -p 123456
docker-compose run cli import -e dev@caliopen.local -f mbox -p devtools/fixtures/mbox/dev@caliopen.local
docker-compose up -d proxyapi lmtpd identitypoller
