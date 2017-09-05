// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package rest_api

import (
	obj "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations/contacts"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations/messages"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations/participants"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations/tags"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations/users"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	log "github.com/Sirupsen/logrus"
	"github.com/go-openapi/loads"
	"gopkg.in/gin-gonic/gin.v1"
	"gopkg.in/redis.v5"
	"os"
)

var (
	server *REST_API
)

type (
	REST_API struct {
		config   APIConfig
		cache    *redis.Client
		swagSpec *loads.Document
	}

	APIConfig struct {
		Host          string `mapstructure:"host"`
		Port          string `mapstructure:"port"`
		SwaggerFile   string `mapstructure:"swaggerSpec"`
		BackendConfig `mapstructure:"BackendConfig"`
		IndexConfig   `mapstructure:"IndexConfig"`
		CacheSettings `mapstructure:"RedisConfig"`
		NatsConfig    `mapstructure:"NatsConfig"`
	}

	BackendConfig struct {
		BackendName string          `mapstructure:"backend_name"`
		Settings    BackendSettings `mapstructure:"backend_settings"`
	}

	BackendSettings struct {
		Hosts            []string      `mapstructure:"hosts"`
		Keyspace         string        `mapstructure:"keyspace"`
		Consistency      uint16        `mapstructure:"consistency_level"`
		SizeLimit        uint64        `mapstructure:"raw_size_limit"` // max size for db (in bytes)
		ObjStoreType     string        `mapstructure:"object_store"`
		ObjStoreSettings obj.OSSConfig `mapstructure:"object_store_settings"`
	}

	IndexConfig struct {
		IndexName string        `mapstructure:"index_name"`
		Settings  IndexSettings `mapstructure:"index_settings"`
	}

	IndexSettings struct {
		Hosts []string `mapstructure:"hosts"`
	}

	CacheSettings struct {
		Host     string `mapstructure:"host"`
		Password string `mapstructure:"password"`
		Db       int    `mapstructure:"db"`
	}
	NatsConfig struct {
		Url           string `mapstructure:"url"`
		OutSMTP_topic string `mapstructure:"outSMTP_topic"`
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
			BackendName:  config.BackendName,
			Hosts:        config.BackendConfig.Settings.Hosts,
			Keyspace:     config.BackendConfig.Settings.Keyspace,
			Consistency:  config.BackendConfig.Settings.Consistency,
			SizeLimit:    config.BackendConfig.Settings.SizeLimit,
			ObjStoreType: config.BackendConfig.Settings.ObjStoreType,
			OSSConfig:    config.BackendConfig.Settings.ObjStoreSettings,
		},
		RESTindexConfig: obj.RESTIndexConfig{
			IndexName: config.IndexConfig.IndexName,
			Hosts:     config.IndexConfig.Settings.Hosts,
		},
		NatsConfig: obj.NatsConfig{
			Url:           config.NatsConfig.Url,
			OutSMTP_topic: config.NatsConfig.OutSMTP_topic,
		},
	}

	err := caliopen.Initialize(caliopenConfig)

	if err != nil {
		log.WithError(err).Fatal("Caliopen facilities initialization failed")
	}

	client := redis.NewClient(&redis.Options{
		Addr:     config.CacheSettings.Host,
		Password: config.CacheSettings.Password,
		DB:       config.CacheSettings.Db,
	})
	_, err = client.Ping().Result()
	if err != nil {
		return err
	}
	server.cache = client

	//checks that with could open the swagger specs file
	_, err = os.Stat(server.config.SwaggerFile)
	if err != nil {
		return err
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

	err := http_middleware.InitSwaggerMiddleware(server.config.SwaggerFile)
	if err != nil {
		log.WithError(err).Warn("init swagger middleware failed")
	} else {
		router.Use(http_middleware.SwaggerValidator())
	}
	// adds our routes and handlers
	api := router.Group(http_middleware.RoutePrefix)
	server.AddHandlers(api)

	// listens
	addr := server.config.Host + ":" + server.config.Port
	err = router.Run(addr)
	if err != nil {
		log.WithError(err).Warn("unable to start gin server")
	}
	return err
}

func (server *REST_API) AddHandlers(api *gin.RouterGroup) {

	/** users API **/
	//u := api.Group("/users")
	identities := api.Group(http_middleware.IdentitiesRoute, http_middleware.BasicAuthFromCache(server.cache, "caliopen"))
	identities.GET("/locals", users.GetLocalsIdentities)
	identities.GET("/locals/:identity_id", users.GetLocalIdentity)

	/** username API **/
	api.GET("/username/isAvailable", users.IsAvailable)

	/** messages API **/
	msg := api.Group("/messages", http_middleware.BasicAuthFromCache(server.cache, "caliopen"))
	msg.GET("", messages.GetMessagesList)
	msg.GET("/:message_id", messages.GetMessage)
	msg.POST("/:message_id/actions", messages.Actions)
	//attachments
	msg.POST("/:message_id/attachments", messages.UploadAttachment)
	msg.DELETE("/:message_id/attachments/:attachment_id", messages.DeleteAttachment)
	msg.GET("/:message_id/attachments/:attachment_id", messages.DownloadAttachment)

	/** participants API **/
	parts := api.Group("/participants", http_middleware.BasicAuthFromCache(server.cache, "caliopen"))
	parts.GET("/suggest", participants.Suggest)

	/** contacts API **/
	cts := api.Group("/contacts", http_middleware.BasicAuthFromCache(server.cache, "caliopen"))
	cts.GET("/:contact_id/identities", contacts.GetIdentities)

	/** tags API **/
	tag := api.Group(http_middleware.TagsRoute, http_middleware.BasicAuthFromCache(server.cache, "caliopen"))
	tag.GET("", tags.RetrieveUserTags)
	tag.POST("", tags.CreateTag)
	tag.GET("/:tag_id", tags.RetrieveTag)
	tag.PATCH("/:tag_id", tags.PatchTag)
	tag.DELETE("/:tag_id", tags.DeleteTag)
}
