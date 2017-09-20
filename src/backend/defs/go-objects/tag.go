// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"bytes"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/satori/go.uuid"
	"gopkg.in/oleiade/reflections.v1"
	"time"
)

type Tag struct {
	Date_insert      time.Time `cql:"date_insert"             json:"date_insert"            formatter:"RFC3339Milli"`
	Importance_level int32     `cql:"importance_level"        json:"importance_level"`
	Name             string    `cql:"name"                    json:"name"`
	Tag_id           UUID      `cql:"tag_id"                  json:"tag_id"                 formatter:"rfc4122"`
	Type             TagType   `cql:"type"                    json:"type"`
	User_id          UUID      `cql:"user_id"                 json:"user_id"      formatter:"rfc4122"`
}

type TagType string

const (
	UserTag   TagType = "user"
	SystemTag TagType = "system"
)

// bespoke implementation of the json.Marshaller interface
// outputs a JSON representation of an object
// this marshaler takes account of custom tags
func (tag Tag) MarshalJSON() ([]byte, error) {
	var jsonBuf bytes.Buffer
	enc := json.NewEncoder(&jsonBuf)

	fields, err := reflections.Fields(tag)
	if err != nil {
		return jsonBuf.Bytes(), err
	}
	jsonBuf.WriteByte('{')
	first := true
	for _, field := range fields {
		j_field, err := reflections.GetFieldTag(tag, field, "json")
		if err != nil {
			log.WithError(err).Warnf("reflection for field %s failed", field)
		} else {
			if j_field != "" && j_field != "-" {
				if first {
					first = false
				} else {
					jsonBuf.WriteByte(',')
				}
				jsonBuf.WriteString("\"" + j_field + "\":")
				field_value, err := reflections.GetField(tag, field)
				j_formatter, err := reflections.GetFieldTag(tag, field, "formatter")
				if err == nil {
					switch j_formatter {
					case "RFC3339Milli":
						jsonBuf.WriteString("\"" + field_value.(time.Time).Format(RFC3339Milli) + "\"")
					default:
						enc.Encode(field_value)
					}
				} else {
					jsonBuf.Write([]byte{'"', '"'})
				}
			} else {
				log.Warnf("Invalid field %s value: %s", field, j_field)
			}
		}
	}
	jsonBuf.WriteByte('}')
	return jsonBuf.Bytes(), nil
}

func (tag *Tag) UnmarshalMap(input map[string]interface{}) error {
	if date, ok := input["date_insert"]; ok {
		tag.Date_insert, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	il, _ := input["importance_level"].(int)
	tag.Importance_level = int32(il)
	tag.Name, _ = input["name"].(string)
	if id, ok := input["tag_id"].(string); ok {
		if id, err := uuid.FromString(id); err == nil {
			tag.Tag_id.UnmarshalBinary(id.Bytes())
		}
	}
	tt, _ := input["type"].(string)
	tag.Type = TagType(tt)
	if id, ok := input["user_id"].(string); ok {
		if id, err := uuid.FromString(id); err == nil {
			tag.User_id.UnmarshalBinary(id.Bytes())
		}
	}
	return nil //TODO: errors handling
}
