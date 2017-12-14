#!/bin/bash
set -ev

CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD`
TARGET_BRANCH=${TRAVIS_BRANCH:="master"}
PROJECT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

if [[ "${CURRENT_BRANCH}" == "master" ]]; then
    # IF something happen on master, test everything
    BACKEND_CHANGE="yes"
    FRONTEND_CHANGE="yes"
else
    BACKEND_CHANGE=`(cd $PROJECT_DIRECTORY && git diff-tree --no-commit-id --name-only -r HEAD..$TARGET_BRANCH -- src/backend)`
    FRONTEND_CHANGE=`(cd $PROJECT_DIRECTORY && git diff-tree --no-commit-id --name-only -r HEAD..$TARGET_BRANCH -- src/frontend)`
fi

function do_backend_tests {
    # Test build of go containers
    cd ${PROJECT_DIRECTORY}/devtools
    docker-compose build api broker
    # Python unittests
    ./setup-virtualenv.sh

    cd ${PROJECT_DIRECTORY}
    source .venv/bin/activate

    export CALIOPEN_BASEDIR=${PROJECT_DIRECTORY}
    nosetests -sv src/backend/main/py.main/caliopen_main/tests
    nosetests -sv src/backend/components/py.pi/caliopen_pi/tests
}

function do_frontend_tests {
    (cd $PROJECT_DIRECTORY/src/frontend/web_application && yarn && yarn test)
}


if [[ "x${BACKEND_CHANGE}" != "x" ]]; then
    echo "##### Doing backend tests"
    do_backend_tests
fi

if [[ "x${FRONTEND_CHANGE}" != "x" ]]; then
    echo "##### Doing frontend tests"
    do_frontend_tests
fi
