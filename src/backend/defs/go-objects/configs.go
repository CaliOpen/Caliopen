package objects

type (
	CaliopenConfig struct {
		RESTstoreConfig RESTstoreConfig
		//RESTindexConfig RESTindexConfig
		//NatsConfig      NatsConfig
		//LDAstoreConfig  LDAstoreConfig
	}

	// REST API
	RESTstoreConfig struct {
		BackendName string   `mapstructure:"backend_name"`
		Hosts       []string `mapstructure:"hosts"`
		Keyspace    string   `mapstructure:"keyspace"`
		Consistency uint16   `mapstructure:"consistency_level"`
	}

	/*
		RESTindexConfig struct {

		}
	*/
	// NATS
	/*
		NatsConfig struct {

		}
	*/
	// LDA
	/*
		LDAConfig struct {
			BackendConfig    LDAstoreConfig `mapstructure:"backend_settings"`
			NumberOfWorkers  int            `mapstructure:"lda_workers_size"`
			LogReceivedMails bool           `mapstructure:"log_received_mails"`
			NatsURL          string         `mapstructure:"nats_url"`
			NatsTopic        string         `mapstructure:"nats_topic"`
		}

		LDAstoreConfig struct {
	                BackendName      string         `mapstructure:"backend_name"`
			Hosts       []string `mapstructure:"hosts"`
			Keyspace    string   `mapstructure:"keyspace"`
			Consistency uint16   `mapstructure:"consistency_level"`
		}
	*/
)
