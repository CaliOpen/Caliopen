// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"bytes"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/satori/go.uuid"
	"gopkg.in/oleiade/reflections.v1"
	"time"
)

type Message struct {
	Attachments         []Attachment       `cql:"attachments"              json:"attachments"       `
	Body_html           string             `cql:"body_html"                json:"body_html"         `
	Body_plain          string             `cql:"body_plain"               json:"body_plain"        `
	Date                time.Time          `cql:"date"                     json:"date"                                         formatter:"RFC3339Milli"`
	Date_delete         time.Time          `cql:"date_delete"              json:"date_delete"                                  formatter:"RFC3339Milli"`
	Date_insert         time.Time          `cql:"date_insert"              json:"date_insert"                                  formatter:"RFC3339Milli"`
	Discussion_id       UUID               `cql:"discussion_id"            json:"discussion_id"                                formatter:"rfc4122"`
	External_references ExternalReferences `cql:"external_references"      json:"external_references"`
	Identities          []Identity         `cql:"identities"               json:"identities"       `
	Importance_level    int32              `cql:"importance_level"         json:"importance_level" `
	Is_answered         bool               `cql:"is_answered"              json:"is_answered"      `
	Is_draft            bool               `cql:"is_draft"                 json:"is_draft"         `
	Is_unread           bool               `cql:"is_unread"                json:"is_unread"        `
	Message_id          UUID               `cql:"message_id"               json:"message_id"                                   formatter:"rfc4122"`
	Parent_id           string             `cql:"parent_id"                json:"parent_id"        `
	Participants        []Participant      `cql:"participants"             json:"participants"     `
	Privacy_features    PrivacyFeatures    `cql:"privacy_features"         json:"privacy_features" `
	PrivacyIndex        *PrivacyIndex      `cql:"pi"                 json:"pi"`
	Raw_msg_id          UUID               `cql:"raw_msg_id"               json:"raw_msg_id"                                   formatter:"rfc4122"`
	Subject             string             `cql:"subject"                  json:"subject"          `
	Tags                []Tag              `cql:"tags"                     json:"tags"             `
	Type                string             `cql:"type"                     json:"type"             `
	User_id             UUID               `cql:"user_id"                  json:"user_id"                  elastic:"omit"      formatter:"rfc4122"`
}

// params to pass to API to get a messages list
type MessagesListFilter struct {
	Limit   int
	Offset  int
	Terms   map[string]string
	User_id UUID
}

// bespoke implementation of the json.Marshaller interface
// outputs a JSON representation of an object
// this marshaler takes account of custom tags for given 'context'
func (msg *Message) JSONMarshaller(context string) ([]byte, error) {
	var jsonBuf bytes.Buffer
	enc := json.NewEncoder(&jsonBuf)

	fields, err := reflections.Fields(*msg)
	if err != nil {
		return jsonBuf.Bytes(), err
	}
	jsonBuf.WriteByte('{')
	first := true
	body_not_merged := true
fieldsLoop:
	for _, field := range fields {
		j_field, err := reflections.GetFieldTag(*msg, field, "json")
		if err != nil {
			log.WithError(err).Warnf("reflection for field %s failed", field)
		} else {
			if j_field != "" && j_field != "-" {
				switch context {
				case "elastic":
					j_elastic, err := reflections.GetFieldTag(*msg, field, "elastic")
					if err == nil {
						switch j_elastic {
						case "omit":
							continue fieldsLoop
						}
					}
				case "frontend":
					//output only one body for frontend clients
					if field == "Body_html" || field == "Body_plain" {
						if body_not_merged {
							if first {
								first = false
							} else {
								jsonBuf.WriteByte(',')
							}
							jsonBuf.WriteString("\"body\":")
							// TODO : put html or plain in exported body regarding current user preferences
							if msg.Body_html != "" {
								enc.Encode(msg.Body_html)
							} else {
								enc.Encode(msg.Body_plain)
							}

							body_not_merged = false
							continue fieldsLoop
						} else {
							continue fieldsLoop
						}
					}
				}
				if first {
					first = false
				} else {
					jsonBuf.WriteByte(',')
				}
				jsonBuf.WriteString("\"" + j_field + "\":")
				field_value, err := reflections.GetField(*msg, field)
				j_formatter, err := reflections.GetFieldTag(*msg, field, "formatter")
				if err == nil {
					switch j_formatter {
					case "rfc4122":
						enc.Encode(field_value)
					case "RFC3339Milli":
						jsonBuf.WriteString("\"" + field_value.(time.Time).Format(RFC3339Milli) + "\"")
					case "TimeUTCmicro":
						jsonBuf.WriteString("\"" + field_value.(time.Time).Format(TimeUTCmicro) + "\"")
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

func (msg *Message) MarshalJSON() ([]byte, error) {
	return msg.JSONMarshaller("json")
}

func (msg *Message) MarshalES() ([]byte, error) {
	return msg.JSONMarshaller("elastic")
}

// return a JSON representation of Message suitable for frontend client
func (msg *Message) MarshalFrontEnd() ([]byte, error) {
	return msg.JSONMarshaller("frontend")
}

func (msg *Message) UnmarshalJSON(b []byte) error {
	input := map[string]interface{}{}
	if err := json.Unmarshal(b, &input); err != nil {
		return err
	}
	if _, ok := input["attachments"]; ok {
		for _, attachment := range input["attachments"].([]interface{}) {
			a := attachment.(map[string]interface{})
			A := Attachment{}
			A.Content_type, _ = a["content_type"].(string)
			A.File_name, _ = a["file_name"].(string)
			A.Is_inline, _ = a["is_inline"].(bool)
			size, _ := a["size"].(float64)
			A.Size = int(size)
			A.URL, _ = a["url"].(string)
			A.MimeBoundary, _ = a["mime_boundary"].(string)
			msg.Attachments = append(msg.Attachments, A)
		}
	}
	msg.Body_html, _ = input["body_html"].(string)
	msg.Body_plain, _ = input["body_plain"].(string)
	if date, ok := input["date"]; ok {
		msg.Date, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	if date, ok := input["date_delete"]; ok {
		msg.Date_delete, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	if date, ok := input["date_insert"]; ok {
		msg.Date_insert, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	if discussion_id, ok := input["discussion_id"].(string); ok {
		if id, err := uuid.FromString(discussion_id); err == nil {
			msg.Discussion_id.UnmarshalBinary(id.Bytes())
		}
	}
	if ex_ref, ok := input["external_references"].(map[string]interface{}); ok {
		msg.External_references = ExternalReferences{}
		msg.External_references.Ancestors_ids, _ = ex_ref["ancestors_ids"].([]string)
		msg.External_references.Message_id, _ = ex_ref["message_id"].(string)
		msg.External_references.Parent_id, _ = ex_ref["parent_id"].(string)
	}
	if _, ok := input["identities"]; ok {
		for _, identity := range input["identities"].([]interface{}) {
			i := identity.(map[string]interface{})
			I := Identity{}
			I.Identifier, _ = i["identifier"].(string)
			I.Type, _ = i["type"].(string)

			msg.Identities = append(msg.Identities, I)
		}
	}
	importance_level, _ := input["importance_level"].(float64)
	msg.Importance_level = int32(importance_level)
	msg.Is_answered, _ = input["is_answered"].(bool)
	msg.Is_draft, _ = input["is_draft"].(bool)
	msg.Is_unread, _ = input["is_unread"].(bool)
	if message_id, ok := input["message_id"].(string); ok {
		if id, err := uuid.FromString(message_id); err == nil {
			msg.Message_id.UnmarshalBinary(id.Bytes())
		}
	}
	msg.Parent_id, _ = input["parent_id"].(string)
	msg.Participants = []Participant{}
	if _, ok := input["participants"]; ok {
		for _, participant := range input["participants"].([]interface{}) {
			p := participant.(map[string]interface{})
			P := Participant{}
			P.Address, _ = p["address"].(string)
			P.Label, _ = p["labebl"].(string)
			P.Protocol, _ = p["protocol"].(string)
			P.Type, _ = p["type"].(string)
			if _, ok := p["contact_ids"]; ok {
				P.Contact_ids = []UUID{}
				for _, contact_id := range p["contact_ids"].([]interface{}) {
					c_id := contact_id.(string)
					var contact_uuid UUID
					if id, err := uuid.FromString(c_id); err == nil {
						contact_uuid.UnmarshalBinary(id.Bytes())
					}
					P.Contact_ids = append(P.Contact_ids, contact_uuid)
				}
			}
			msg.Participants = append(msg.Participants, P)
		}
	}
	i_pi, _ := input["pi"].(map[string]interface{})
	pi := PrivacyIndex{}
	pi.Comportment, _ = i_pi["comportment"].(int)
	pi.Context, _ = i_pi["context"].(int)
	pi.DateUpdate, _ = i_pi["date_update"].(time.Time)
	pi.Technic, _ = i_pi["technic"].(int)
	pi.Version, _ = i_pi["version"].(int)
	msg.PrivacyIndex = &pi

	//TODO: privacy_features
	if raw_msg_id, ok := input["raw_msg_id"].(string); ok {
		if id, err := uuid.FromString(raw_msg_id); err == nil {
			msg.Raw_msg_id.UnmarshalBinary(id.Bytes())
		}
	}
	msg.Subject, _ = input["subject"].(string)
	//TODO: tags
	msg.Type, _ = input["type"].(string)
	if user_id, ok := input["user_id"].(string); ok {
		if id, err := uuid.FromString(user_id); err == nil {
			msg.User_id.UnmarshalBinary(id.Bytes())
		}
	}

	return nil
}

// unmarshal a map[string]interface{} coming from gocql
func (msg *Message) UnmarshalCQLMap(input map[string]interface{}) {
	if _, ok := input["attachments"]; ok {
		for _, attachment := range input["attachments"].([]map[string]interface{}) {
			a := Attachment{}
			a.Content_type, _ = attachment["content_type"].(string)
			a.File_name, _ = attachment["file_name"].(string)
			a.Is_inline, _ = attachment["is_inline"].(bool)
			a.Size, _ = attachment["size"].(int)
			a.URL, _ = attachment["url"].(string)
			a.MimeBoundary, _ = attachment["mime_boundary"].(string)
			msg.Attachments = append(msg.Attachments, a)
		}
	}
	msg.Body_html, _ = input["body_html"].(string)
	msg.Body_plain, _ = input["body_plain"].(string)
	msg.Date, _ = input["date"].(time.Time)
	msg.Date_delete, _ = input["date_delete"].(time.Time)
	msg.Date_insert, _ = input["date_insert"].(time.Time)
	if discussion_id, ok := input["discussion_id"].(gocql.UUID); ok {
		msg.Discussion_id.UnmarshalBinary(discussion_id.Bytes())
	}
	if ex_ref, ok := input["external_references"].(map[string]interface{}); ok {
		msg.External_references = ExternalReferences{}
		msg.External_references.Ancestors_ids, _ = ex_ref["ancestors_ids"].([]string)
		msg.External_references.Message_id, _ = ex_ref["message_id"].(string)
		msg.External_references.Parent_id, _ = ex_ref["parent_id"].(string)
	}
	if _, ok := input["identities"]; ok {
		for _, identity := range input["identities"].([]map[string]interface{}) {
			i := Identity{}
			i.Identifier, _ = identity["identifier"].(string)
			i.Type, _ = identity["type"].(string)

			msg.Identities = append(msg.Identities, i)
		}
	}
	importance_level, _ := input["importance_level"].(int)
	msg.Importance_level = int32(importance_level)
	msg.Is_answered, _ = input["is_answered"].(bool)
	msg.Is_draft, _ = input["is_draft"].(bool)
	msg.Is_unread, _ = input["is_unread"].(bool)
	message_id, _ := input["message_id"].(gocql.UUID)
	msg.Message_id.UnmarshalBinary(message_id.Bytes())
	msg.Parent_id, _ = input["parent_id"].(string)
	msg.Participants = []Participant{}
	if _, ok := input["participants"]; ok {
		for _, participant := range input["participants"].([]map[string]interface{}) {
			p := Participant{}
			p.Address, _ = participant["address"].(string)
			p.Label, _ = participant["label"].(string)
			p.Protocol, _ = participant["protocol"].(string)
			p.Type, _ = participant["type"].(string)
			if _, ok := participant["contact_ids"]; ok {
				p.Contact_ids = []UUID{}
				for _, id := range participant["contact_ids"].([]gocql.UUID) {
					var contact_uuid UUID
					contact_uuid.UnmarshalBinary(id.Bytes())
					p.Contact_ids = append(p.Contact_ids, contact_uuid)
				}
			}
			msg.Participants = append(msg.Participants, p)
		}
	}
	i_pi, _ := input["pi"].(map[string]interface{})
	pi := PrivacyIndex{}
	pi.Comportment, _ = i_pi["comportment"].(int)
	pi.Context, _ = i_pi["context"].(int)
	pi.DateUpdate, _ = i_pi["date_update"].(time.Time)
	pi.Technic, _ = i_pi["technic"].(int)
	pi.Version, _ = i_pi["version"].(int)
	msg.PrivacyIndex = &pi
	//TODO: privacy_features
	if raw_msg_id, ok := input["raw_msg_id"].(gocql.UUID); ok {
		msg.Raw_msg_id.UnmarshalBinary(raw_msg_id.Bytes())
	}
	msg.Subject, _ = input["subject"].(string)
	//TODO: tags
	msg.Type, _ = input["type"].(string)
	if user_id, ok := input["user_id"].(gocql.UUID); ok {
		msg.User_id.UnmarshalBinary(user_id.Bytes())
	}
}
