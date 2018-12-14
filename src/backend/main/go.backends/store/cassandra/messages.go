// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package store

import (
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/gocassa/gocassa"
	"gopkg.in/oleiade/reflections.v1"
)

func (cb *CassandraBackend) CreateMessage(msg *Message) error {

	messageT := cb.IKeyspace.Table("message", &Message{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "message_id"},
	}).WithOptions(gocassa.Options{TableName: "message"}) // need to overwrite default gocassa table naming convention

	return messageT.Set(msg).Run()
}

func (cb *CassandraBackend) RetrieveMessage(user_id, msg_id string) (msg *Message, err error) {
	msg = new(Message).NewEmpty().(*Message) // correctly initialize nested values
	m := map[string]interface{}{}
	q := cb.SessionQuery(`SELECT * FROM message WHERE user_id = ? and message_id = ?`, user_id, msg_id)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	msg.UnmarshalCQLMap(m)
	return msg, err

}

// update given fields for a message in db
func (cb *CassandraBackend) UpdateMessage(msg *Message, fields map[string]interface{}) error {

	//get cassandra's field name for each field to modify
	cassaFields := map[string]interface{}{}
	for field, value := range fields {
		cassaField, err := reflections.GetFieldTag(msg, field, "cql")
		if err != nil {
			return fmt.Errorf("[CassandraBackend] UpdateMessage failed to find a cql field for object field %s", field)
		}
		cassaFields[cassaField] = value
	}

	messageT := cb.IKeyspace.Table("message", &Message{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "message_id"},
	}).WithOptions(gocassa.Options{TableName: "message"}) // need to overwrite default gocassa table naming convention

	err := messageT.
		Where(gocassa.Eq("user_id", msg.User_id.String()), gocassa.Eq("message_id", msg.Message_id.String())).
		Update(cassaFields).
		Run()
	return err
}

func (cb *CassandraBackend) DeleteMessage(msg *Message) error {
	return errors.New("[CassandraBackend] DeleteMessage not yet implemented")
}

func (cb *CassandraBackend) SetMessageUnread(user_id, message_id string, status bool) (err error) {
	q := cb.SessionQuery(`UPDATE message SET is_unread= ? WHERE message_id = ? AND user_id = ?`, status, message_id, user_id)
	return q.Exec()
}
