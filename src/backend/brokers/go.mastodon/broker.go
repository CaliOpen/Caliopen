// Copyleft (ɔ) 2018 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package mastodonbroker

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/facilities/Notifications"
	log "github.com/Sirupsen/logrus"
	"github.com/CaliOpen/go-mastodon"
	"github.com/nats-io/go-nats"
)

type (
	MastodonBroker struct {
		Config            BrokerConfig
		Connectors        MastodonBrokerConnectors
		Index             backends.LDAIndex
		NatsConn          *nats.Conn
		Notifier          Notifications.Notifiers
		Store             backends.LDAStore
		natsSubscriptions []*nats.Subscription
	}

	BrokerConfig struct {
		IndexConfig          IndexConfig `mapstructure:"index_settings"`
		IndexName            string      `mapstructure:"index_name"`
		NatsQueue            string      `mapstructure:"nats_queue"`
		NatsURL              string      `mapstructure:"nats_url"`
		NatsTopicPoller      string      `mapstructure:"nats_topic_poller"`
		NatsTopicPollerCache string      `mapstructure:"nats_topic_poller_cache"`
		NatsTopicDMs         string      `mapstructure:"nats_topic_direct_message"`
		StoreConfig          StoreConfig `mapstructure:"store_settings"`
		StoreName            string      `mapstructure:"store_name"`
		LDAConfig            LDAConfig   `mapstructure:"LDAConfig"`
	}

	MastodonBrokerConnectors struct {
		Egress chan NatsCom
		Halt   chan struct{}
	}

	DMpayload struct {
		Toot     *mastodon.Toot
		Err      error
		Response chan MastodonDeliveryAck
	}

	// MastodonAck embeds response from Mastodon API to pass back to broker.
	MastodonDeliveryAck struct {
		Payload  *mastodon.Status `json:"-"`
		Err      bool             `json:"error"`
		Response string           `json:"message,omitempty"`
	}

	// natsCom is used to communicate between nats handler and broker
	NatsCom struct {
		Order BrokerOrder
		Ack   chan *DeliveryAck
	}
)

func Initialize(conf BrokerConfig, store backends.LDAStore, index backends.LDAIndex, natsConn *nats.Conn, notifier *Notifications.Notifier) (broker *MastodonBroker, err error) {
	broker = new(MastodonBroker)
	broker.Config = conf
	broker.Store = store
	broker.Index = index
	broker.NatsConn = natsConn
	broker.Notifier = notifier
	broker.Connectors = MastodonBrokerConnectors{
		Egress: make(chan NatsCom, 5),
		Halt:   make(chan struct{}),
	}
	return
}

func (broker *MastodonBroker) ShutDown() {
	broker.NatsConn.Close()
	broker.Store.Close()
	broker.Index.Close()
	close(broker.Connectors.Egress)
	close(broker.Connectors.Halt)
	log.WithField("MastodonBroker", "shutdown").Info()
}
