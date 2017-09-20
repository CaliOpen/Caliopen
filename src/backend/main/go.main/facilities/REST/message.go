// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/helpers"
)

func (rest *RESTfacility) SetMessageUnread(user_id, message_id string, status bool) (err error) {

	err = rest.store.SetMessageUnread(user_id, message_id, status)
	if err != nil {
		return err
	}

	err = rest.index.SetMessageUnread(user_id, message_id, status)
	return err
}

func (rest *RESTfacility) GetRawMessage(raw_message_id string) (raw_message []byte, err error) {
	raw_msg, err := rest.store.GetRawMessage(raw_message_id)
	if err != nil {
		return
	}
	return []byte(raw_msg.Raw_data), nil
}

//return a list of messages given filter parameters
//messages are sanitized, ie : ready for display in front interface, and an excerpt of body is generated
func (rest *RESTfacility) GetMessagesList(filter IndexSearch) (messages []*Message, totalFound int64, err error) {
	messages, totalFound, err = rest.index.FilterMessages(filter)
	if err != nil {
		return []*Message{}, 0, err
	}
	for _, msg := range messages {
		helpers.SanitizeMessageBodies(msg)
		(*msg).Body_excerpt = helpers.ExcerptMessage(*msg, 200, true, true)
	}
	return
}

//return a sanitized message, ready for display in front interface
func (rest *RESTfacility) GetMessage(user_id, msg_id string) (msg *Message, err error) {
	msg, err = rest.store.GetMessage(user_id, msg_id)
	if err != nil {
		return nil, err
	}
	helpers.SanitizeMessageBodies(msg)
	(*msg).Body_excerpt = helpers.ExcerptMessage(*msg, 200, true, true)
	return msg, err
}
