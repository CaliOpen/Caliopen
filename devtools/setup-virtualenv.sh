#!/bin/bash
CALIOPEN_BASE_DIR=$(pwd)/..
CALIOPEN_BACKEND_DIR=${CALIOPEN_BASE_DIR}/src/backend


cd ${CALIOPEN_BASE_DIR}
if [[ -d ".venv3" ]]; then
    echo "Virtual environment exist, drop it first"
    # exit 1
fi

virtualenv --python=python3 .venv3
. .venv3/bin/activate

if [[ "x${VIRTUAL_ENV}" == "x" ]]; then
    echo 'Virtual environment did not activate'
    exit 1
fi


# Force installation of regex using pip
pip install regex

COMPONENTS="main/py.storage main/py.main components/py.pi interfaces/REST/py.server interfaces/NATS/py.client tools/py.CLI components/py.pgp tools/py.doc"

for comp in ${COMPONENTS}:
do

    cd ${CALIOPEN_BACKEND_DIR}/${comp}
    if [[ -f "requirements.txt" ]]; then
        pip install -r requirements.txt
    fi
    python setup.py develop
    if [[ $? -ne 0 ]]; then
        echo "Error during installation of component ${comp}"
        exit 2
    fi

done

# Extra packages for development
pip install ipdb
pip install docker-compose
pip install gitpython
pip install nose

echo "All done, your virtual environment contain these packages :"
pip freeze

cd ${CALIOPEN_BASE_DIR}

echo "Do not forget to activate it"
