#!/bin/bash

# Generate swagger specifications from JSON schema definitions

set -e
PROJECT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

DEST_DIR=${PROJECT_DIRECTORY}/doc/api
SRC_DIR=${PROJECT_DIRECTORY}/src/backend/defs/rest-api
SWAGGER_CLI_DIR=${PROJECT_DIRECTORY}/devtools/swagger-cli
SWAGGER_JS=${SWAGGER_CLI_DIR}/node_modules/.bin/swagger
CMD="yarn start -- bundle -r ${SRC_DIR}/swagger-root.yaml -o ${DEST_DIR}/swagger.json"


if [[ ! -f "${SWAGGER_JS}" ]]; then
	echo "You should have nodejs > 6 and yarn"
	echo "Run npm install swagger in ${DEST_DIR} directory"

	(cd $SWAGGER_CLI_DIR && yarn install)
fi


(cd $SWAGGER_CLI_DIR && ${CMD})

set +e
