// Copyleft (ɔ) 2019 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package mastodonbroker

import (
	"encoding/json"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/CaliOpen/go-mastodon"
	"github.com/pkg/errors"
	"github.com/satori/go.uuid"
	"strings"
	"time"
)

// SaveRawDM marshal DM to json and save it as a raw message object in store
func (broker *MastodonBroker) SaveRawDM(dm *mastodon.Status, userId UUID) (rawMessageId UUID, err error) {

	jsonDM, e := json.Marshal(dm)
	if e != nil {
		err = fmt.Errorf("[Mastodon Broker]SaveRawDM failed to marshal dm to json : %s", e)
		return
	}

	rawMsg := RawMessage{
		Raw_msg_id: UUID(uuid.NewV4()),
		Raw_Size:   uint64(len(jsonDM)),
		Raw_data:   string(jsonDM),
		Delivered:  false,
	}

	e = broker.Store.StoreRawMessage(rawMsg)
	if e != nil {
		err = fmt.Errorf("[Mastodon Broker]SaveRawDM failed to store raw message in store : %s", e)
		return
	}

	return rawMsg.Raw_msg_id, nil
}

func (b *MastodonBroker) SaveIndexSentDM(initialOrder BrokerOrder, ack *MastodonDeliveryAck) error {
	// save raw status in db
	rawMsgId, err := b.SaveRawDM(ack.Payload, UUID(uuid.FromStringOrNil(initialOrder.UserId)))
	if err != nil {
		return err
	}

	// TODO: handle attachments

	// Retrieve user informations
	user, err := b.Store.RetrieveUser(initialOrder.UserId)
	if err != nil {
		return err
	}
	userInfo := &UserInfo{User_id: user.UserId.String(), Shard_id: user.ShardId}

	// update caliopen message status
	message, err := b.Store.RetrieveMessage(initialOrder.UserId, initialOrder.MessageId)
	if err != nil {
		return err
	}
	fields := make(map[string]interface{})
	var date time.Time
	date = ack.Payload.CreatedAt
	message.Raw_msg_id = rawMsgId
	fields["Raw_msg_id"] = message.Raw_msg_id
	message.Is_draft = false
	fields["Is_draft"] = message.Is_draft
	message.Date = date
	fields["Date"] = message.Date
	message.Date_sort = date
	fields["Date_sort"] = message.Date_sort
	//fields["Attachments"] = TODO
	message.External_references = ExternalReferences{
		Message_id: string(ack.Payload.ID),
	}
	fields["External_references"] = message.External_references

	err = b.Store.UpdateMessage(message, fields)
	if err != nil {
		log.WithError(err).Warn("[SaveIndexSentDM] Store.UpdateMessage operation failed")
		return err
	}

	err = b.Index.UpdateMessage(userInfo, message, fields)
	if err != nil {
		log.WithError(err).Warn("[SaveIndexSentDM] Index.UpdateMessage operation failed")
		return err
	}
	return nil
}

// UnmarshalDM creates a new Caliopen Message entity from a mastodon status
func UnmarshalDM(dm *mastodon.Status, userId UUID) (message *Message, err error) {
	return nil, errors.New("not implemented")
}

// MarshalDM builds a Mastodon toot with visibility=direct from a Caliopen message
func MarshalDM(msg *Message) (toot *mastodon.Toot, err error) {
	var body strings.Builder
	for _, participant := range msg.Participants {
		if participant.Type != "From" {
			body.WriteString("@" + participant.Address + " ")
		}
	}
	body.WriteString(msg.Body_plain)
	toot = &mastodon.Toot{
		Status:      body.String(),
		InReplyToID: mastodon.ID(msg.External_references.Parent_id),
		Visibility:  "direct",
	}
	return
}

// IDgreaterThan compares two mastodon IDs and returns true if first ID is greater or equal to second one
// string IDs a representation of integers, but what is faster to do ? strconv to int , or len + lexically sorting ?
func IDgreaterOrEqual(first, second string) bool {
	if len(first) > len(second) {
		return true
	}
	if len(first) == len(second) {
		return first >= second
	}
	return false
}
