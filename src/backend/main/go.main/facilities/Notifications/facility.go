// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package Notifications

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/index/elasticsearch"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/store/cassandra"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/nats-io/go-nats"
)

type (
	Notifiers interface {
		EmailNotifiers
	}

	Notifier struct {
		index              backends.NotificationsIndex
		nats_outSMTP_topic string
		queue              *nats.Conn
		store              backends.NotificationsStore
		admin              *User          //Admin user on whose behalf actions could be done
		adminLocalID       *LocalIdentity // admin's local identity used to send emails
		config             *NotifierConfig
	}
)

// NewNotificationsFacility initialises the notifiers
// it takes the same store & index configurations than the REST API for now
func NewNotificationsFacility(config CaliopenConfig, queue *nats.Conn) (notifier *Notifier) {
	notifier = new(Notifier)
	notifier.queue = queue
	notifier.config = &config.NotifierConfig
	notifier.nats_outSMTP_topic = config.NatsConfig.OutSMTP_topic
	switch config.RESTstoreConfig.BackendName {
	case "cassandra":
		cassaConfig := store.CassandraConfig{
			Hosts:       config.RESTstoreConfig.Hosts,
			Keyspace:    config.RESTstoreConfig.Keyspace,
			Consistency: gocql.Consistency(config.RESTstoreConfig.Consistency),
		}
		if config.RESTstoreConfig.ObjStoreType == "s3" {
			cassaConfig.WithObjStore = true
			cassaConfig.OSSConfig.Endpoint = config.RESTstoreConfig.OSSConfig.Endpoint
			cassaConfig.OSSConfig.AccessKey = config.RESTstoreConfig.OSSConfig.AccessKey
			cassaConfig.OSSConfig.SecretKey = config.RESTstoreConfig.OSSConfig.SecretKey
			cassaConfig.OSSConfig.Location = config.RESTstoreConfig.OSSConfig.Location
			cassaConfig.OSSConfig.RawMsgBucket = config.RESTstoreConfig.OSSConfig.Buckets["raw_messages"]
			cassaConfig.OSSConfig.AttachmentBucket = config.RESTstoreConfig.OSSConfig.Buckets["temporary_attachments"]
		}
		backend, err := store.InitializeCassandraBackend(cassaConfig)
		if err != nil {
			log.WithError(err).Fatalf("Initalization of %s backend failed", config.RESTstoreConfig.BackendName)
		}
		notifier.store = backends.NotificationsStore(backend) // type conversion
	default:
		log.Fatalf("Unknown backend: %s", config.RESTstoreConfig.BackendName)
	}

	switch config.RESTindexConfig.IndexName {
	case "elasticsearch":
		esConfig := index.ElasticSearchConfig{
			Urls: config.RESTindexConfig.Hosts,
		}
		index, err := index.InitializeElasticSearchIndex(esConfig)
		if err != nil {
			log.WithError(err).Fatalf("Initalization of %s index failed", config.RESTindexConfig.IndexName)
		}
		notifier.index = backends.NotificationsIndex(index) // type conversion
	default:
		log.Fatalf("Unknown index: %s", config.RESTindexConfig.IndexName)
	}

	user, err := notifier.store.UserByUsername(config.NotifierConfig.AdminUsername)
	if err != nil {
		log.WithError(err).Warnf("Failed to retrieve admin user <%s>", config.NotifierConfig.AdminUsername)
	} else if user != nil {
		notifier.admin = user
		ids, err := notifier.store.GetLocalsIdentities(user.UserId.String())
		if err != nil {
			log.WithError(err).Warnf("Failed to retrieve local identities for admin user <%s>", config.NotifierConfig.AdminUsername)
		} else {
			// get first local identity found for now
			notifier.adminLocalID = &(ids[0])
		}
	}

	return notifier
}
