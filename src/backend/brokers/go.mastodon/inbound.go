// Copyleft (ɔ) 2019 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package mastodonbroker

import (
	"encoding/json"
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/facilities/Notifications"
	log "github.com/Sirupsen/logrus"
	"github.com/mattn/go-mastodon"
	"github.com/satori/go.uuid"
	"time"
)

const (
	natsMessageTmpl  = "{\"order\":\"%s\",\"user_id\":\"%s\",\"identity_id\":\"%s\",\"message_id\": \"%s\"}"
	natsOrderRaw     = "process_raw"
	NatsError        = "nats error"
	lastSeenInfosKey = "lastseendm"
	lastSyncInfosKey = "lastsync"
)

// ProcessInDM is in charge of saving raw DM before further processing (could be unmarshalled too)
// it ends by
//      sending natsOrderRaw for other stack components
//      sending new message notification if everything went good
//      updating remote identity state in db
func (broker *MastodonBroker) ProcessInDM(userID, remoteID UUID, dm *mastodon.Status, rawOnly bool, batch *Notifications.BatchNotification) error {

	rawID, err := broker.SaveRawDM(dm, userID)
	if err != nil {
		return err
	}
	// send process order to nats
	natsMessage := fmt.Sprintf(natsMessageTmpl, natsOrderRaw, userID.String(), remoteID.String(), rawID.String())
	resp, err := broker.NatsConn.Request(broker.Config.LDAConfig.InTopic, []byte(natsMessage), 30*time.Second)
	if err != nil {
		if broker.NatsConn.LastError() != nil {
			log.WithError(broker.NatsConn.LastError()).Warnf("[MastodonBroker] failed to publish inbound request on NATS for user %s. Raw message has been saved with id %s", userID.String(), rawID.String())
			log.Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
		} else {
			log.WithError(err).Warnf("[MastodonBroker] failed to publish inbound request on NATS for user %s. Raw message has been saved with id %s", userID.String(), rawID.String())
			log.Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
		}
		return errors.New(NatsError)
	}
	// handle nats response
	nats_ack := new(map[string]interface{})
	err = json.Unmarshal(resp.Data, &nats_ack)
	if err != nil {
		log.WithError(err).Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
		return errors.New("[ProcessInDM] failed to parse inbound ack on NATS")
	}
	if err, ok := (*nats_ack)["error"]; ok {
		if err == DuplicateMessage {
			return nil
		}
		log.WithError(errors.New(err.(string))).Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
		return errors.New("[ProcessInDM] inbound delivery failed")
	}
	// nats delivery OK, notify user
	notif := Notification{
		Emitter: "mastodonBroker",
		Type:    NewMessageNotif,
		TTLcode: LongLived,
		User: &User{
			UserId: userID,
		},
		NotifId: UUID(uuid.NewV1()),
		Body:    `{"message_id": "` + (*nats_ack)["message_id"].(string) + `", "discussion_id":"` + (*nats_ack)["discussion_id"].(string) + `"}`,
	}
	if batch != nil {
		batch.Add(notif)
	} else {
		go broker.Notifier.ByNotifQueue(&notif)
	}
	// update raw_message table to set raw_message.delivered=true
	go broker.Store.SetDeliveredStatus(rawID.String(), true)
	return nil

}
