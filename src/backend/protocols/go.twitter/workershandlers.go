package twitterworker

import (
	"errors"
	broker "github.com/CaliOpen/Caliopen/src/backend/brokers/go.twitter"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/index/elasticsearch"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/store/cassandra"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/facilities/Notifications"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/nats-io/go-nats"
	"sync"
)

type (
	Worker struct {
		AccountWorkers map[string]*AccountWorker // one worker per active Twitter account
		Index          backends.LDAIndex
		NatsConn       *nats.Conn
		NatsSubs       []*nats.Subscription
		Notifier       *Notifications.Notifier
		Store          backends.LDAStore
		WorkersGuard   *sync.RWMutex
		Conf           WorkerConfig
	}

	WorkerConfig struct {
		TwitterAppKey    string              `mapstructure:"twitter_app_key"`
		TwitterAppSecret string              `mapstructure:"twitter_app_secret"`
		BrokerConfig     broker.BrokerConfig `mapstructure:"BrokerConfig"`
	}
)

func InitAndStartWorker(conf WorkerConfig) (worker *Worker, err error) {

	worker = &Worker{
		WorkersGuard:   new(sync.RWMutex),
		AccountWorkers: map[string]*AccountWorker{},
		Conf:           conf,
	}

	// init Store
	switch conf.BrokerConfig.StoreName {
	case "cassandra":
		c := store.CassandraConfig{
			Hosts:       conf.BrokerConfig.StoreConfig.Hosts,
			Keyspace:    conf.BrokerConfig.StoreConfig.Keyspace,
			Consistency: gocql.Consistency(conf.BrokerConfig.StoreConfig.Consistency),
			SizeLimit:   conf.BrokerConfig.StoreConfig.SizeLimit,
			UseVault:    conf.BrokerConfig.StoreConfig.UseVault,
		}
		if conf.BrokerConfig.StoreConfig.ObjectStore == "s3" {
			c.WithObjStore = true
			c.Endpoint = conf.BrokerConfig.StoreConfig.OSSConfig.Endpoint
			c.AccessKey = conf.BrokerConfig.StoreConfig.OSSConfig.AccessKey
			c.SecretKey = conf.BrokerConfig.StoreConfig.OSSConfig.SecretKey
			c.RawMsgBucket = conf.BrokerConfig.StoreConfig.OSSConfig.Buckets["raw_messages"]
			c.AttachmentBucket = conf.BrokerConfig.StoreConfig.OSSConfig.Buckets["temporary_attachments"]
			c.Location = conf.BrokerConfig.StoreConfig.OSSConfig.Location
		}
		if conf.BrokerConfig.StoreConfig.UseVault {
			c.HVaultConfig.Url = conf.BrokerConfig.StoreConfig.VaultConfig.Url
			c.HVaultConfig.Username = conf.BrokerConfig.StoreConfig.VaultConfig.Username
			c.HVaultConfig.Password = conf.BrokerConfig.StoreConfig.VaultConfig.Password
		}
		b, e := store.InitializeCassandraBackend(c)
		if e != nil {
			err = e
			log.WithError(err).Warnf("[TwitterWorker] initialization of %s backend failed", conf.BrokerConfig.StoreName)
			return
		}

		worker.Store = backends.LDAStore(b) // type conversion to LDA interface
	default:
		log.Warnf("[TwitterWorker] unknown store backend: %s", conf.BrokerConfig.StoreName)
		err = errors.New("[TwitterWorker] unknown store backend")
		return

	}

	// init Index
	switch conf.BrokerConfig.LDAConfig.IndexName {
	case "elasticsearch":
		c := index.ElasticSearchConfig{
			Urls: conf.BrokerConfig.LDAConfig.IndexConfig.Urls,
		}
		i, e := index.InitializeElasticSearchIndex(c)
		if e != nil {
			err = e
			log.WithError(err).Warnf("[EmailBroker] initialization of %s backend failed", conf.BrokerConfig.IndexName)
			return
		}

		worker.Index = backends.LDAIndex(i) // type conversion to LDA interface
	default:
		log.Warnf("[TwitterBroker] unknown index backend: %s", conf.BrokerConfig.LDAConfig.IndexName)
		err = errors.New("[TwitterBroker] unknown index backend")
		return
	}

	worker.NatsConn, err = nats.Connect(conf.BrokerConfig.NatsURL)
	if err != nil {
		log.WithError(err).Warn("[EmailBroker] initalization of NATS connexion failed")
		return
	}
	caliopenConfig := CaliopenConfig{
		NotifierConfig: conf.BrokerConfig.LDAConfig.NotifierConfig,
		NatsConfig: NatsConfig{
			Url: conf.BrokerConfig.NatsURL,
		},
		RESTstoreConfig: RESTstoreConfig{
			BackendName:  conf.BrokerConfig.StoreName,
			Consistency:  conf.BrokerConfig.StoreConfig.Consistency,
			Hosts:        conf.BrokerConfig.StoreConfig.Hosts,
			Keyspace:     conf.BrokerConfig.StoreConfig.Keyspace,
			OSSConfig:    conf.BrokerConfig.StoreConfig.OSSConfig,
			ObjStoreType: conf.BrokerConfig.StoreConfig.ObjectStore,
			SizeLimit:    conf.BrokerConfig.StoreConfig.SizeLimit,
		},
		RESTindexConfig: RESTIndexConfig{
			Hosts:     conf.BrokerConfig.LDAConfig.IndexConfig.Urls,
			IndexName: conf.BrokerConfig.LDAConfig.IndexName,
		},
	}
	worker.Notifier = Notifications.NewNotificationsFacility(caliopenConfig, worker.NatsConn)

	// init Nats connector
	worker.NatsConn, err = nats.Connect(conf.BrokerConfig.NatsURL)
	if err != nil {
		log.WithError(err).Fatal("[TwitterWorker] initialization of NATS connexion failed")
	}
	worker.NatsSubs = make([]*nats.Subscription, 2)
	worker.NatsSubs[0], err = worker.NatsConn.QueueSubscribe(conf.BrokerConfig.NatsTopicWorkers, conf.BrokerConfig.NatsQueue, worker.WorkerMsgHandler)
	if err != nil {
		log.WithError(err).Fatal("[TwitterWorker] initialization of NATS fetcher subscription failed")
	}

	worker.NatsSubs[1], err = worker.NatsConn.QueueSubscribe(conf.BrokerConfig.NatsTopicDMs, conf.BrokerConfig.NatsQueue, worker.DMmsgHandler)
	if err != nil {
		log.WithError(err).Fatal("[TwitterWorker] initialization of NATS fetcher subscription failed")
	}

	worker.NatsConn.Flush()

	// init Notifier

	return
}

func (worker *Worker) Stop() {
	for _, w := range worker.AccountWorkers {
		w.WorkerDesk <- Stop
	}
	for _, sub := range worker.NatsSubs {
		sub.Unsubscribe()
	}
	worker.NatsConn.Close()
}

// getOrCreateWorker returns a pointer to a worker already in cache
// or tries to create a new worker for the remote identity if not.
// returns nil if get or create failed.
func (w *Worker) getOrCreateWorker(userId, remoteId string) *AccountWorker {
	if accountWorker, ok := w.AccountWorkers[userId+remoteId]; ok {
		return accountWorker
	} else {
		log.Infof("[getOrCreateWorker] failed to retrieve registered worker for remote %s (user %s). Trying to add one.", remoteId, userId)
		if userId == "" || remoteId == "" {
			return nil
		}
		accountWorker, err := NewAccountWorker(userId, remoteId, *w)
		if err != nil {
			log.WithError(err).Warnf("[getOrCreateWorker] failed to create new worker for remote %s (user %s)", remoteId, userId)
			return nil
		}
		w.RegisterWorker(accountWorker)
		go accountWorker.Start()
		return accountWorker

	}
}

func (w *Worker) RegisterWorker(accountWorker *AccountWorker) {
	workerKey := accountWorker.userAccount.userID.String() + accountWorker.userAccount.remoteID.String()
	// do not register same broker twice
	if registeredWorker, ok := w.AccountWorkers[workerKey]; ok {
		w.RemoveAccountWorker(registeredWorker)
	}
	w.WorkersGuard.Lock()
	w.AccountWorkers[workerKey] = accountWorker
	w.WorkersGuard.Unlock()
}

func (w *Worker) RemoveAccountWorker(accountWorker *AccountWorker) {
	workerKey := accountWorker.userAccount.userID.String() + accountWorker.userAccount.remoteID.String()
	w.WorkersGuard.Lock()
	accountWorker.Stop()
	delete(w.AccountWorkers, workerKey)
	w.WorkersGuard.Unlock()
}
