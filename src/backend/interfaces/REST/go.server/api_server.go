package rest_api

import (
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server/operations/users"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends/store/cassandra"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"gopkg.in/gin-gonic/gin.v1"
)

var (
	server *REST_API
)

type (
	REST_API struct {
		config  APIConfig
		store *backends.APIStorage
	}

	APIConfig struct {
		Host          string `mapstructure:"host"`
		Port          string `mapstructure:"port"`
		BackendConfig `mapstructure:"BackendConfig"`
	}

	BackendConfig struct {
		BackendName string          `mapstructure:"backend_name"`
		Settings    BackendSettings `mapstructure:"backend_settings"`
	}

	BackendSettings struct {
		Hosts       []string          `mapstructure:"hosts"`
		Keyspace    string            `mapstructure:"keyspace"`
		Consistency gocql.Consistency `mapstructure:"consistency_level"`
	}
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
		backend := &store.CassandraBackend{}
		cassaConfig := store.CassandraConfig{
			Hosts:       server.config.BackendConfig.Settings.Hosts,
			Keyspace:    server.config.BackendConfig.Settings.Keyspace,
			Consistency: server.config.BackendConfig.Settings.Consistency,
		}
		err := backend.Initialize(cassaConfig)
		if err != nil {
			log.WithError(err).Fatalf("Initalization of %s backend failed", server.config.BackendName)
		}
		b := backends.APIStorage(backend)
		server.store = &b
	case "BOBcassandra":
	// NotImplemented… yet ! ;-)
	default:
		log.Fatalf("Unknown backend: %s", server.config.BackendName)
	}

	return nil
}

func StartServer() error {
	return server.start()
}

func (server *REST_API) start() error {
	// Creates a gin router with default middleware:
	// logger and recovery (crash-free) middleware
	router := gin.Default()
        // adds our middlewares
        router.Use(SwaggerInboundValidation())
	router.Use(BindBackend())

        // adds our routes and handlers
        api := router.Group("/api/v2")
        AddHandlers(api)

        // listens
	addr := server.config.Host + ":" + server.config.Port
	err := router.Run(addr)
        if err != nil {
                log.WithError(err).Info("unable to start gin server")
        }
	return err
}

func BindBackend() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("APIStore", server.store)
		c.Next()
	}
}

func AddHandlers(api *gin.RouterGroup) {

        //users API
        usrs := api.Group("/users")
        usrs.POST("/", users.Create)
        usrs.GET("/:user_id", users.Get)

        //username API
        api.GET("/username/isAvailable", users.IsAvailable)
}
