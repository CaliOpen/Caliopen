#!/bin/sh

arg0=$(basename "$0" .sh)
blnk=$(echo "$arg0" | sed 's/./ /g')

usage_info()
{
    echo "Usage: $arg0 [{-d|--dev} app] \\"
    echo
    echo "Start Caliopen using docker in local environment"
    echo "  supported apps for development: frontend"
}

usage()
{
    exec 1>2   # Send standard output to standard error
    usage_info
    exit 1
}

error()
{
    echo "$arg0: $*" >&2
    exit 1
}

help()
{
    usage_info
    echo
    echo "Options:"
    echo
    echo "  {-h|--help}               -- show this help then exit"
    echo "  {-d|--dev} app            -- define which App to dev"
    exit 0
}

flags()
{
    while test $# -gt 0
    do
        case "$1" in
        (-d|--dev)
            shift
            [ $# = 0 ] && error "A App is required for development"
            export DEV_APP="$1"
            shift;;
        (-h|--help)
            help;;
        (*) usage;;
        esac
    done
}

flags "$@"

set +e
set -v
sudo sysctl -w vm.max_map_count=262144

set -e

# init db & co
docker-compose run cli -h
docker-compose up -d objectstore
# sleep 60
docker-compose up -d proxyapi lmtpd identitypoller

if [ "$DEV_APP" = "frontend" ]; then
  echo "start frontend in dev mode"
  docker-compose up frontend_dev
else
    docker-compose up -d frontend
fi
