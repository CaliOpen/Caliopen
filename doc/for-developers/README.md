# Documentation for developers

In this directory provide generic documentations for Caliopen.

* [Guidelines](Guidelines.md)
* [Repository structure](Repository_structure.md)

# ReST API documentation

ReST API is documented using [OpenAPI specification v2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
you will find the related swagger definition file [here](../api/swagger.json) and the JSON Schema definitions files [here](../../src/backend/defs/rest-api/)

You can interact with the API using auto generated documentation.
Using docker containers, just run:

```
cd ../../devtools
docker-compose build
docker-compose up -d api
```

Then use your browser to go to [api documentation](http://localhost:6543/api-ui/#/) interactive documentation.
