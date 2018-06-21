// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package store

import (
	"errors"
	obj "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
	"io"
)

func (cb *CassandraBackend) StoreRawMessage(msg obj.RawMessage) (err error) {
	rawMsgTable := cb.IKeyspace.MapTable("raw_message", "raw_msg_id", &obj.RawMessage{})
	consistency := gocql.Consistency(cb.CassandraConfig.Consistency)

	// need to overwrite default gocassa naming convention that add `_map_name` to the mapTable name
	rawMsgTable = rawMsgTable.WithOptions(gocassa.Options{
		TableName:   "raw_message",
		Consistency: &consistency,
	})

	// handle emails too large to fit into cassandra
	if msg.Raw_Size > cb.CassandraConfig.SizeLimit {
		if cb.CassandraConfig.WithObjStore {
			uri, err := cb.ObjectsStore.PutRawMessage(msg.Raw_msg_id, msg.Raw_data)
			if err != nil {
				return err
			}
			msg.URI = uri
			msg.Raw_data = ""
		} else {
			return errors.New("Object too large to fit into cassandra")
		}
	}

	if err = rawMsgTable.Set(msg).Run(); err != nil {
		return err
	}
	return
}

// returns a RawMessage object, with 'raw_data' property always filled
// (even if raw_data was stored outside of cassandra)
func (cb *CassandraBackend) GetRawMessage(raw_message_id string) (message obj.RawMessage, err error) {

	m := map[string]interface{}{}
	q := cb.Session.Query(`SELECT * FROM raw_message WHERE raw_msg_id = ?`, raw_message_id)
	err = q.MapScan(m)
	if err != nil {
		return obj.RawMessage{}, err
	}
	message.UnmarshalCQLMap(m)

	// check if raw_data is filled or if we need to get it from object store
	if message.URI != "" && len(message.Raw_data) == 0 {
		reader, e := cb.ObjectsStore.GetObject(message.URI)
		if e != nil {
			return obj.RawMessage{}, e
		}
		raw_data := make([]byte, message.Raw_Size)
		s, e := reader.Read(raw_data)
		if s == 0 || e != io.EOF {
			return obj.RawMessage{}, e
		}
		if uint64(s) != message.Raw_Size {
			log.Warnf("[cassandra.GetRawMessage] : Read %d bytes from Object Store, expected %d.", s, message.Raw_Size)
		}
		message.Raw_data = string(raw_data)
	}
	return
}

func (cb *CassandraBackend) SetDeliveredStatus(raw_msg_id string, delivered bool) error {
	return cb.Session.Query(`UPDATE raw_message SET delivered = ? WHERE raw_msg_id = ?`, delivered, raw_msg_id).Exec()
}
