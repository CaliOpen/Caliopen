#!/bin/bash
set -ev

BACKEND_CHANGE=`git diff-tree --no-commit-id --name-only -r HEAD..master src/backend`
FRONTEND_CHANGE=`git diff-tree --no-commit-id --name-only -r HEAD..master src/frontend`


function do_backend_tests {
    docker-compose run cli setup
    docker-compose run cli create_user -e dev@caliopen.local -g John -f Doe -p blablabla
    docker-compose run cli import -e dev@caliopen.local -f mbox -p /srv/caliopen/code/devtools/fixtures/mbox/dev@caliopen.local
}

function do_frontend_tests {
    (cd ../src/frontend/web_application && npm i && npm test)
}


if [[ "x${BACKEND_CHANGE}" != "x" ]]; then
    echo "##### Doing backend tests"
    do_backend_tests
fi

if [[ "x${FRONTEND_CHANGE}" != "x" ]]; then
    echo "##### Doing frontend tests"
    do_frontend_tests
fi

