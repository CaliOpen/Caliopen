package rest_api

import (
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends/store/cassandra"
	log "github.com/Sirupsen/logrus"
	"github.com/emicklei/go-restful"
	"github.com/gocql/gocql"
	"net/http"
)

var (
	server *REST_API
)

func InitializeServer(config APIConfig) error {
	server = new(REST_API)
	return server.initialize(config)
}

func (server *REST_API) initialize(config APIConfig) error {
	server.config = config

	//db initialization
	switch server.config.BackendConfig.BackendName {
	case "cassandra":
		server.db = &store.CassandraBackend{}
		cassaConfig := store.CassandraConfig{
			Hosts:       server.config.BackendConfig.Settings.Hosts,
			Keyspace:    server.config.BackendConfig.Settings.Keyspace,
			Consistency: server.config.BackendConfig.Settings.Consistency,
		}
		err := server.db.Initialize(cassaConfig)
		if err != nil {
			log.WithError(err).Fatalf("Initalization of %s backend failed", server.config.BackendName)
		}
	case "BOBcassandra":
	// NotImplemented… yet ! ;-)
	default:
		log.Fatalf("Unknown backend: %s", server.config.BackendName)
	}

	server.handler = &apiHandler{server.db}
	return nil
}

func StartServer() error {
	return server.start()
}

func (server *REST_API) start() error {

        wsContainer := restful.NewContainer()
        u := userNameAvailability{}
        u.Register(wsContainer)

        addr := server.config.Host + ":" + server.config.Port
        log.Printf("HTTP REST API server listening on %s", addr)
        server.httpServe = &http.Server{Addr: addr, Handler: wsContainer}
        log.Fatal(server.httpServe.ListenAndServe())
        return nil
}

func StopServer() {

}

type userNameAvailability struct {
	username  string `json:"username"`
	available bool   `json:"available"`
}

func (u *userNameAvailability) userNameLookup(request *restful.Request, response *restful.Response) {
        username := request.QueryParameter("username")

	if username == "" {
		log.Error("username not provided")
                response.WriteJson(userNameAvailability{username, false}, "application/json; charset=utf-8")
                return
	}

	UserNameStorage := backends.UserNameStorage(server.handler.backend)

	available, err := UserNameStorage.IsAvailable(username)
	if available && err == nil {
                response.AddHeader("content-type", "application/json; charset=utf-8")
                response.WriteAsJson(userNameAvailability{username, true})
                return
	}
        response.AddHeader("content-type", "application/json; charset=utf-8")
        response.WriteAsJson(userNameAvailability{username, false})
        return
}

func (u *userNameAvailability) Register(container *restful.Container) {
        ws := new(restful.WebService)

        ws.
        Path("/api/v2/users").
                Consumes(restful.MIME_XML, restful.MIME_JSON).
                Produces(restful.MIME_JSON, restful.MIME_XML)

        ws.Route(ws.GET("/isAvailable").To(u.userNameLookup).
                Doc("check if an username is available for creation").
                Param(ws.QueryParameter("username", "username that is being seek").DataType("string").Required(true)).
                Writes(userNameAvailability{}))

        container.Add(ws)
}

type REST_API struct {
	handler *apiHandler
	config  APIConfig
	db      *store.CassandraBackend
        httpServe *http.Server
}

type apiHandler struct {
	backend *store.CassandraBackend
}

type APIConfig struct {
	Host          string `mapstructure:"host"`
	Port          string `mapstructure:"port"`
	BackendConfig `mapstructure:"BackendConfig"`
}

type BackendConfig struct {
	BackendName string          `mapstructure:"backend_name"`
	Settings    BackendSettings `mapstructure:"backend_settings"`
}

type BackendSettings struct {
	Hosts       []string          `mapstructure:"hosts"`
	Keyspace    string            `mapstructure:"keyspace"`
	Consistency gocql.Consistency `mapstructure:"consistency_level"`
}
