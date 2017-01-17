// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package store

import (
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
)

// part of LDABackend interface
func (cb *CassandraBackend) StoreRaw(raw_email string) (uuid string, err error) {
	rawMsgTable := cb.IKeyspace.MapTable("raw_inbound_msg", "raw_msg_id", &obj.RawMessageModel{})
	consistency := gocql.Consistency(cb.CassandraConfig.Consistency)

	// need to overwrite default gocassa naming convention that add `_map_name` to the mapTable name
	rawMsgTable = rawMsgTable.WithOptions(gocassa.Options{
		TableName:   "raw_inbound_message",
		Consistency: &consistency,
	})

	raw_uuid, err := gocql.RandomUUID()
	m := obj.RawMessageModel{
		Raw_msg_id: raw_uuid,
		Data:       raw_email,
	}
	err = rawMsgTable.Set(m).Run()

	uuid = raw_uuid.String()
	return
}
