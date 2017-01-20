#### HTTP REST front-end interface for Caliopen application
This package launches a HTTP server to interact with Caliopen services.
By default, a proxy server runs in front of the http server to route requests to py.server or go.server as needed. For now, routes /api/v1/ are handled by py.server and routes /api/v2 by go server. 

##### Installation
A list of required dependencies is in `vendor/vendor.json`.  
To install go dependencies, run `govendor sync` from within `src/backend/interfaces/REST/go.server` directory.  
To compile the binary run `go build github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server/cmd/caliopen_rest`

##### Usage
Configuration files are in `src/backend/configs`.  
To launch the server from source files :   

```
$ cd cmd/caliopen_rest/
$ go run main.go serve  
```

To disable the proxy server : 
`go run main.go serve --proxy=false`

