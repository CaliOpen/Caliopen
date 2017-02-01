package caliopen

import (
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends/store/cassandra"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/nats-io/go-nats"
)

var (
	Facilities *CaliopenFacilities
)

type (
	CaliopenFacilities struct {
		config obj.CaliopenConfig

		// REST API facility
		RESTstore    *backends.APIStorage
		RESTservices RESTservices
		//RESTindex *backends.APIindex

		// NATS facility
		nats *nats.Conn

		// LDA facility
		LDAstore *backends.LDABackend
	}

	RESTservices interface {
                UsernameIsAvailable (string) (bool, error)
	}
)

func Initialize(config obj.CaliopenConfig) error {
	Facilities = new(CaliopenFacilities)
	return Facilities.initialize(config)
}

func (facilities *CaliopenFacilities) initialize(config obj.CaliopenConfig) error {
	facilities.config = config

	//REST store initialization
	switch config.RESTstoreConfig.BackendName {
	case "cassandra":
		backend := &store.CassandraBackend{}
		cassaConfig := store.CassandraConfig{
			Hosts:       config.RESTstoreConfig.Hosts,
			Keyspace:    config.RESTstoreConfig.Keyspace,
			Consistency: gocql.Consistency(config.RESTstoreConfig.Consistency),
		}
		err := backend.Initialize(cassaConfig)
		if err != nil {
			log.WithError(err).Fatalf("Initalization of %s backend failed", config.RESTstoreConfig.BackendName)
		}
		b := backends.APIStorage(backend)
		facilities.RESTstore = &b
	case "BOBcassandra":
	// NotImplemented… yet ! ;-)
	default:
		log.Fatalf("Unknown backend: %s", config.RESTstoreConfig.BackendName)
	}

        //REST services registration
        facilities.RESTservices = facilities

	return nil
}
