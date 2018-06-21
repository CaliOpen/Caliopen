// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import "github.com/gocql/gocql"

type RawMessage struct {
	//Json_rep   string `cql:"json_rep"          json:"json_rep"` //json representation of the raw message with its envelope
	Delivered  bool   `cql:"delivered"         json:"delivered"`
	Raw_msg_id UUID   `cql:"raw_msg_id"        json:"raw_msg_id"`
	Raw_data   string `cql:"raw_data"          json:"raw_data"` //could be empty if raw message is too large to be stored in db
	Raw_Size   uint64 `cql:"raw_size"          json:"raw_size"`
	URI        string `cql:"uri"               json:"uri"` //object's location if message is too large to be stored in db
}

// unmarshal a map[string]interface{} that must owns all Message fields
func (msg *RawMessage) UnmarshalCQLMap(input map[string]interface{}) {
	if raw_msg_id, ok := input["raw_msg_id"].(gocql.UUID); ok {
		msg.Raw_msg_id.UnmarshalBinary(raw_msg_id.Bytes())
	}
	if raw_data, ok := input["raw_data"].([]byte); ok {
		msg.Raw_data = string(raw_data)
	}
	if size, ok := input["raw_size"].(int); ok {
		msg.Raw_Size = uint64(size)
	}
	if uri, ok := input["uri"].(string); ok {
		msg.URI = uri
	}
}
