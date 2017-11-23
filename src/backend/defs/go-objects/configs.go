package objects

type (
	CaliopenConfig struct {
		RESTstoreConfig RESTstoreConfig
		RESTindexConfig RESTIndexConfig
		NatsConfig      NatsConfig
		CacheConfig     CacheConfig
		NotifierConfig  NotifierConfig
	}

	// REST API
	RESTstoreConfig struct {
		BackendName  string   `mapstructure:"backend_name"`
		Hosts        []string `mapstructure:"hosts"`
		Keyspace     string   `mapstructure:"keyspace"`
		Consistency  uint16   `mapstructure:"consistency_level"`
		SizeLimit    uint64   `mapstructure:"raw_size_limit"` // max size for db (in bytes)
		ObjStoreType string   `mapstructure:"object_store"`
		OSSConfig    `mapstructure:"object_store_settings"`
	}

	RESTIndexConfig struct {
		IndexName string   `mapstructure:"index_name"`
		Hosts     []string `mapstructure:"hosts"`
	}

	// redis
	CacheConfig struct {
		Host     string `mapstructure:"host"`
		Password string `mapstructure:"password"`
		Db       int    `mapstructure:"db"`
	}

	// NATS
	NatsConfig struct {
		Url           string `mapstructure:"url"`
		OutSMTP_topic string `mapstructure:"outSMTP_topic"`
	}
	// Objects Store
	OSSConfig struct {
		Endpoint  string            `mapstructure:"endpoint"`
		AccessKey string            `mapstructure:"access_key"`
		SecretKey string            `mapstructure:"secret_key"`
		Location  string            `mapstructure:"location"`
		Buckets   map[string]string `mapstructure:"buckets"`
	}

	// Notifications facility
	NotifierConfig struct {
		AdminUsername string `mapstructure:"admin_username"`
		BaseUrl       string `mapstructure:"base_url"`       // url upon which to build custom links sent to users. No trailing slash please.
		TemplatesPath string `mapstructure:"templates_path"` // path to templates Notifiers may need to access to
	}
)
