// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
        "github.com/gocql/gocql"
        "time"
)

type RawMessage struct {
	//Json_rep   string `cql:"json_rep"          json:"json_rep"` //json representation of the raw message with its envelope
	Raw_msg_id   UUID       `cql:"raw_msg_id"        json:"raw_msg_id"`
	Raw_data     string     `cql:"raw_data"          json:"raw_data"` //could be empty if raw message is too large to be stored in db
	Raw_Size     uint64     `cql:"raw_size"          json:"raw_size"`
	URI          string     `cql:"uri"               json:"uri"` //object's location if message is too large to be stored in db
        InternalDate time.Time  `cql:"internal_date"     json:"internal_date"` //the date the message was received by the server
        Server       string     `cql:"server"            json:"server"`
        Protocol     string     `cql:"protocol"          json:"protocol"`
        VersionTLS   string     `cql:"version_tls"       json:"version_tls"`
        CipherSuite  string     `cql:"cipher_suite"      json:"ciphersuite"`
}

// unmarshal a map[string]interface{} that must owns all Message fields
func (msg *RawMessage) UnmarshalCQLMap(input map[string]interface{}) {
	raw_msg_id, _ := input["raw_msg_id"].(gocql.UUID)
	msg.Raw_msg_id.UnmarshalBinary(raw_msg_id.Bytes())
	raw_data, _ := input["raw_data"].([]byte)
	msg.Raw_data = string(raw_data)
	size, _ := input["raw_size"].(int)
	msg.Raw_Size = uint64(size)
	msg.URI, _ = input["uri"].(string)
	internal_date, _ := input["internal_date"].(time.Time)
	msg.InternalDate = time.Time(internal_date) 
	server, _ := input["server"].(string)
	msg.Server = string(server)
	protocol, _ := input["protocol"].(string)
	msg.Protocol = string(protocol)
	version_tls, _ := input["version_tls"].(string)
	msg.VersionTLS = string(version_tls)
	cipher_suite, _ := input["cipher_suite"].(string)
	msg.CipherSuite = string(cipher_suite)
}
