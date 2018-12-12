/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package twitter_broker

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/facilities/Notifications"
	"github.com/CaliOpen/go-twitter/twitter"
	log "github.com/Sirupsen/logrus"
	"github.com/nats-io/go-nats"
)

type (
	TwitterBroker struct {
		Config            BrokerConfig
		Connectors        TwitterBrokerConnectors
		Index             backends.LDAIndex
		NatsConn          *nats.Conn
		Notifier          Notifications.Notifiers
		Store             backends.LDAStore
		natsSubscriptions []*nats.Subscription
	}

	BrokerConfig struct {
		IndexConfig      IndexConfig `mapstructure:"index_settings"`
		IndexName        string      `mapstructure:"index_name"`
		NatsQueue        string      `mapstructure:"nats_queue"`
		NatsURL          string      `mapstructure:"nats_url"`
		NatsTopicWorkers string      `mapstructure:"nats_topic_worker"`
		NatsTopicDMs     string      `mapstructure:"nats_topic_direct_message"`
		StoreConfig      StoreConfig `mapstructure:"store_settings"`
		StoreName        string      `mapstructure:"store_name"`
		LDAConfig        LDAConfig   `mapstructure:"LDAConfig"`
	}

	TwitterBrokerConnectors struct {
		Egress chan NatsCom
		Halt   chan struct{}
	}

	DMpayload struct {
		DM       *twitter.DirectMessageEvent
		Err      error
		Response chan TwitterDeliveryAck
	}

	// TwitterAck embeds response from Twitter API to pass back to broker.
	TwitterDeliveryAck struct {
		Payload  *twitter.DirectMessageEventsCreateResponse `json:"-"`
		Err      bool                                       `json:"error"`
		Response string                                     `json:"message,omitempty"`
	}

	// natsCom is used to communicate between nats handler and broker
	NatsCom struct {
		Order BrokerOrder
		Ack   chan *DeliveryAck
	}
)

func Initialize(conf BrokerConfig, store backends.LDAStore, index backends.LDAIndex, natsConn *nats.Conn, notifier *Notifications.Notifier) (broker *TwitterBroker, err error) {
	broker = new(TwitterBroker)
	broker.Config = conf
	broker.Store = store
	broker.Index = index
	broker.NatsConn = natsConn
	broker.Notifier = notifier
	broker.Connectors = TwitterBrokerConnectors{
		Egress: make(chan NatsCom, 5),
	}
	return
}

func (broker *TwitterBroker) ShutDown() {
	broker.NatsConn.Close()
	broker.Store.Close()
	broker.Index.Close()
	if _, ok := <-broker.Connectors.Egress; ok {
		close(broker.Connectors.Egress)
	}
	if _, ok := <-broker.Connectors.Halt; ok {
		close(broker.Connectors.Halt)
	}
	log.WithField("TwitterBroker", "shutdown").Info()
}
