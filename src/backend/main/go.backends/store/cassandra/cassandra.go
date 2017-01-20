package store

import (
	log "github.com/Sirupsen/logrus"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
)

var (
	cassa *CassandraBackend
)

type (
	CassandraBackend struct {
		CassandraConfig
		Session   *gocql.Session
		IKeyspace gocassa.KeySpace //gocassa keyspace interface
	}

	CassandraConfig struct {
		Hosts       []string          `mapstructure:"hosts"`
		Keyspace    string            `mapstructure:"keyspace"`
		Consistency gocql.Consistency `mapstructure:"consistency_level"`
	}
)

func Initialize(config CassandraConfig) error {
	cassa = new(CassandraBackend)
	return cassa.Initialize(config)
}

func (cb *CassandraBackend) Initialize(config CassandraConfig) (err error) {

	cb.CassandraConfig = config
	// connect to the cluster
	cluster := gocql.NewCluster(cb.CassandraConfig.Hosts...)
	cluster.Keyspace = cb.Keyspace
	cluster.Consistency = cb.Consistency
	cb.Session, err = cluster.CreateSession()
	if err != nil {
		log.WithError(err).Println("GO REST API unable to create a session to cassandra")
		return err
	}
	connection := gocassa.NewConnection(gocassa.GoCQLSessionToQueryExecutor(cb.Session))
	cb.IKeyspace = connection.KeySpace(cb.Keyspace)

	return
}
