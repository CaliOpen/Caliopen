package rest_api

import (
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends/store/cassandra"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.main/helpers"
	log "github.com/Sirupsen/logrus"
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
	mux := http.NewServeMux()
	mux.Handle("/", server.handler)

	addr := server.config.Host + ":" + server.config.Port
	log.Printf("HTTP REST API server listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
	return nil
}

func StopServer() {

}

func (h *apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		log.Error("username not provided")
		w.Header().Set("content-type", "application/json; charset=utf-8")
		w.Write([]byte(`{"available": false}`))
		return
	}
	if UsernameLookup(username, h.backend) {
		w.Header().Set("content-type", "application/json; charset=utf-8")
		w.Write([]byte(`{"available": false}`))
		return
	}

	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.Write([]byte(`{"available": true}`))
	return
}

func UsernameLookup(username string, db *store.CassandraBackend) bool {
	lookup := helpers.EscapeUsername(username)
	found := map[string]interface{}{}
	err := db.Session.Query(`SELECT COUNT(*) FROM user_name WHERE name = ?`, lookup).MapScan(found)
	if err != nil {
		log.WithError(err).Infof("username lookup error : %v", err)
		return true
	}
	if found["count"].(int64) != 0 {
		return true
	}
	return false
}

type REST_API struct {
	handler *apiHandler
	config  APIConfig
	db      *store.CassandraBackend
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
