package store

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
)

type CassandraBackend struct {
	cassandraConfig
	Session		*gocql.Session
}

type cassandraConfig struct {
	Hosts            	[]string        	`json:"hosts"`
	Keyspace         	string          	`json:"keyspace"`
	ConsistencyLevel 	gocql.Consistency       `json:"consistency_level"`
}

type user struct {
	User_id []byte
	Name    string
}


func (cb *CassandraBackend) Initialize(config map[string]interface{}) error {
	data, err := json.Marshal(config)
	if err != nil {
		log.WithError(err).Info(" error when marshalling backend config")
		return err
	}

	err = json.Unmarshal(data, &cb)

	if err != nil {
		log.WithError(err).Info(" error when marshalling backend config")
		return err
	}

	// connect to the cluster
	cluster := gocql.NewCluster(cb.Hosts...)
	cluster.Keyspace = cb.Keyspace
	cluster.Consistency = cb.ConsistencyLevel
	cb.Session, err = cluster.CreateSession()
	if err != nil {
		log.WithError(err).Println("GO REST API unable to create a session to cassandra")
		return err
	}
	return nil
}



// UserStorage interface
func (cb *CassandraBackend) Get(*obj.User) error {
	return nil
}