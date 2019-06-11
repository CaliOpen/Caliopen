#!/bin/bash
set -e

# if [ "$SRC_CHANGED" = "false" ];
# then
# 	echo "No changes to frontend"
# 	return
# fi

cd src/frontend/web_application
yarn
yarn test
