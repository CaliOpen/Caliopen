#!/bin/bash

# Generate swagger specifications from JSON schema definitions

set -e
PROJECT_DIRECTORY="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

DEST_DIR=${PROJECT_DIRECTORY}/src/backend/configs
SRC_DIR=${PROJECT_DIRECTORY}/src/backend/defs/rest-api
CMD="npx @redocly/cli bundle ${SRC_DIR}/swagger-root.yaml -o ${DEST_DIR}/swagger.json"

${CMD}

set +e
