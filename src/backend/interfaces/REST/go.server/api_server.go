package rest_api

import (
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server/operations/users"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.main"
	log "github.com/Sirupsen/logrus"
	"gopkg.in/gin-gonic/gin.v1"
)

var (
	server *REST_API
	caliop *caliopen.CaliopenFacilities
)

type (
	REST_API struct {
		config APIConfig
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
		Hosts       []string `mapstructure:"hosts"`
		Keyspace    string   `mapstructure:"keyspace"`
		Consistency uint16   `mapstructure:"consistency_level"`
	}
)

func InitializeServer(config APIConfig) error {
	server = new(REST_API)
	return server.initialize(config)
}

func (server *REST_API) initialize(config APIConfig) error {
	server.config = config

	//init Caliopen facility
	caliopenConfig := obj.CaliopenConfig{
		RESTstoreConfig: obj.RESTstoreConfig{
			BackendName: config.BackendName,
			Hosts:       config.BackendConfig.Settings.Hosts,
			Keyspace:    config.BackendConfig.Settings.Keyspace,
			Consistency: config.BackendConfig.Settings.Consistency,
		},
	}

	err := caliopen.Initialize(caliopenConfig)

	if err != nil {
		log.WithError(err).Fatal("Caliopen facilities initialization failed")
	}

	caliop = caliopen.Facilities

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

func AddHandlers(api *gin.RouterGroup) {

	//users API
	u := api.Group("/users")
	u.POST("/", func(ctx *gin.Context) {
		users.Create(caliop, ctx)
	})
	u.GET("/:user_id", func(ctx *gin.Context) {
		users.Get(caliop, ctx)
	})

	//username API
	api.GET("/username/isAvailable", func(ctx *gin.Context) {
		users.IsAvailable(caliop, ctx)
	})
}
