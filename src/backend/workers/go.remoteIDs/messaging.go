// Copyleft (ɔ) 2019 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package go_remoteIDs

import (
	"encoding/json"
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/nats-io/go-nats"
	"github.com/satori/go.uuid"
	"strconv"
)

type MqHandler struct {
	natsConn          *nats.Conn
	natsSubIdentities *nats.Subscription
	natsSubImap       *nats.Subscription
	natsSubTwitter    *nats.Subscription
}

const defaultInterval = "15"

func InitMqHandler() (*MqHandler, error) {
	handler := new(MqHandler)
	natsConn, err := nats.Connect(poller.Config.NatsUrl)
	if err != nil {
		log.WithError(err).Warn("[initMqHandler] : initialization of NATS connexion failed")
		return handler, errors.New("[initMqHandler] failed to init NATS connection")
	}
	handler.natsConn = natsConn
	sub, err := handler.natsConn.QueueSubscribe(poller.Config.NatsTopics["id_cache"], poller.Config.NatsQueue, handler.natsIdentitiesHandler)
	if err != nil {
		log.WithError(err).Warnf("[initMqHandler] : initialization of NATS subscription failed for topic id_cache")
		handler.natsConn = nil
		return handler, errors.New("[initMqHandler] failed to init NATS subscription")
	}
	handler.natsSubIdentities = sub

	sub, err = handler.natsConn.QueueSubscribe(poller.Config.NatsTopics["imap"], poller.Config.NatsQueue, handler.natsImapHandler)
	if err != nil {
		log.WithError(err).Warnf("[initMqHandler] : initialization of NATS subscription failed for topic imap")
		handler.natsConn = nil
		return handler, errors.New("[initMqHandler] failed to init NATS subscription")
	}
	handler.natsSubImap = sub

	sub, err = handler.natsConn.QueueSubscribe(poller.Config.NatsTopics["twitter"], poller.Config.NatsQueue, handler.natsTwitterHandler)
	if err != nil {
		log.WithError(err).Warnf("[initMqHandler] : initialization of NATS subscription failed for topic twitter")
		handler.natsConn = nil
		return handler, errors.New("[initMqHandler] failed to init NATS subscription")
	}
	handler.natsSubTwitter = sub
	return handler, nil
}

// natsIdentitiesHandler handles nats messages received by idpoller on id_cache topic
func (mqh *MqHandler) natsIdentitiesHandler(msg *nats.Msg) {

	var order RemoteIDNatsMessage
	err := json.Unmarshal(msg.Data, &order)
	if err != nil {
		log.WithError(err).Warn("[natsIdentitiesHandler] unable to unmarshal nats order")
		return
	}
	switch order.Order {
	case "update_interval":
		idKey := order.UserId + order.IdentityId
		if entry, ok := poller.dbh.GetCacheEntry(idKey); ok {
			entry.pollInterval = order.OrderParam
			log.Debugf("[natsIdentitiesHandler] updating pollIntervall for entry : %+v", entry)
			poller.dbh.UpdateCacheEntry(entry)
			_, err := poller.sched.UpdateSyncJobFor(entry)
			if err != nil {
				log.WithError(err).Warnf("[natsIngressHandler] failed to updateSyncJobFor %+v", entry)
			}
		}
	case "delete":
		idKey := order.UserId + order.IdentityId
		if entry, ok := poller.dbh.GetCacheEntry(idKey); ok {
			log.Debugf("[natsIdentitiesHandler] deleting cache entry : %+s", idKey)
			poller.dbh.RemoveCacheEntry(idKey)
			poller.sched.RemoveJobFor(entry)
		}
	case "add":
		idKey := order.UserId + order.IdentityId
		var pollInterval string
		// prevent boundaries overflow : min = 1 min, max = 3 days
		if interval, err := strconv.Atoi(order.OrderParam); err == nil && interval > 0 && interval < 3*24*60 {
			pollInterval = order.OrderParam
		} else {
			pollInterval = defaultInterval
		}
		entry := cacheEntry{
			iDkey:          idKey,
			pollInterval:   pollInterval,
			remoteID:       UUID(uuid.FromStringOrNil(order.IdentityId)),
			remoteProtocol: order.Protocol,
			userID:         UUID(uuid.FromStringOrNil(order.UserId)),
		}
		entry, err := poller.sched.AddSyncJobFor(entry)
		if err == nil {
			poller.dbh.UpdateCacheEntry(entry)
		}
	default:
		log.Warnf("no handler for order '%s' on topic '%s'", order.Order, msg.Subject)
	}
}

func (mqh *MqHandler) natsImapHandler(msg *nats.Msg) {
	var req WorkerRequest
	err := json.Unmarshal(msg.Data, &req)
	if err != nil {
		log.WithError(err).Warn("[natsImapHandler] unable to unmarshal nats request")
		e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error : unable to unmarshal request"}`))
		if e != nil {
			log.WithError(e).Warn("[natsImapHandler] failed to publish reply on nats")
		}
	}

	switch req.Order.Order {
	case "need_job":
		job, err := poller.jobs.ConsumePendingJobFor(imapWorker)
		if err != nil {
			if err.Error() == noPendingJobErr {
				e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"no pending job"}`))
				if e != nil {
					log.WithError(e).Warn("[natsImapHandler] failed to publish reply on nats")
				}
			} else {
				log.WithError(err).Warn("[natsImapHandler] failed to get a job for worker")
				e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error"}`))
				if e != nil {
					log.WithError(e).Warn("[natsImapHandler] failed to publish reply on nats")
				}
			}
		} else {
			log.Debugf("[natsImapHandler] replying to %s with job : %+v", msg.Reply, job)
			reply, err := json.Marshal(job.Order)
			if err != nil {
				log.WithError(err).Warnf("[natsImapHandler] failed to json Marshal job : %+v", job)
				e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error"}`))
				if e != nil {
					log.WithError(e).Warn("[natsImapHandler] failed to publish reply on nats")
				}
			}
			// forwarding job to worker
			err = mqh.natsConn.Publish(msg.Reply, reply)
			if err != nil {
				log.WithError(err).Warn("[natsImapHandler] failed to publish reply on nats")
			}
		}
	default:
		log.Warnf("[natsImapHandler] received unknown order : %s", req.Order)
		e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error : unknown order"}`))
		if e != nil {
			log.WithError(e).Warn("[natsImapHandler] failed to publish reply on nats")
		}
	}
}

func (mqh *MqHandler) natsTwitterHandler(msg *nats.Msg) {
	var req WorkerRequest
	err := json.Unmarshal(msg.Data, &req)
	if err != nil {
		log.WithError(err).Warn("[natsTwitterHandler] unable to unmarshal nats request")
		e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error : unable to unmarshal request"}`))
		if e != nil {
			log.WithError(e).Warn("[natsTwitterHandler] failed to publish reply on nats")
		}
	}

	switch req.Order.Order {
	case "need_job":
		job, err := poller.jobs.ConsumePendingJobFor(twitterWorker)
		if err != nil {
			if err.Error() == noPendingJobErr {
				e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"no pending job"}`))
				if e != nil {
					log.WithError(e).Warn("[natsTwitterHandler] failed to publish reply on nats")
				}
			} else {
				log.WithError(err).Warn("[natsTwitterHandler] failed to get a job for worker")
				e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error"}`))
				if e != nil {
					log.WithError(e).Warn("[natsTwitterHandler] failed to publish reply on nats")
				}
			}
		} else {
			log.Debugf("[natsTwitterHandler] replying to %s with job : %+v", msg.Reply, job)
			reply, err := json.Marshal(job.Order)
			if err != nil {
				log.WithError(err).Warnf("[natsTwitterHandler] failed to json Marshal job : %+v", job)
				e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error"}`))
				if e != nil {
					log.WithError(e).Warn("[natsTwitterHandler] failed to publish reply on nats")
				}
			}
			// forwarding job to worker
			err = mqh.natsConn.Publish(msg.Reply, reply)
			if err != nil {
				log.WithError(err).Warn("[natsTwitterHandler] failed to publish reply on nats")
			}
		}
	default:
		log.Warnf("[natsTwitterHandler] received unknown order : %s", req.Order)
		e := mqh.natsConn.Publish(msg.Reply, []byte(`{"order":"error : unknown order"}`))
		if e != nil {
			log.WithError(e).Warn("[natsTwitterHandler] failed to publish reply on nats")
		}
	}
}

func (mqh *MqHandler) Stop() {
	mqh.natsSubIdentities.Unsubscribe()
	mqh.natsSubImap.Unsubscribe()
	mqh.natsSubTwitter.Unsubscribe()
	mqh.natsConn.Close()
}
