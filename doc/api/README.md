# Caliopen REST API documentation

One will finds here the complete documentation within the `swagger.json` file. This file conforms to the swagger/openAPI specifications. 

If the Caliopen application is running, the API documentation can be browsed and test at [http://localhost:6543/api-ui/](http://localhost:6543/api-ui/)


## Generate the swagger.json from definitions

Documentation definitions are splits in [objects definitions](https://github.com/CaliOpen/Caliopen/tree/master/src/backend/defs/rest-api/objects) and [route paths ones](https://github.com/CaliOpen/Caliopen/tree/master/src/backend/defs/rest-api/paths).

To generate a single swagger.json file from theses definition, you need to install [swagger-cli](https://www.npmjs.com/package/swagger-cli) tool

```
# In a npm able environment (having a ./package.json)
npm install swagger-cli
alias swagger="node `pwd`/node_modules/swagger-cli/swagger.json"

# basedir of repository
cd src/backend/defs/rest-api

# Generate local swagger.json to copy if successful
swagger bundle -r swagger-root.json -o swagger.json

```
