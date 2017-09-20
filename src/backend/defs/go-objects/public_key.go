// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"github.com/gocql/gocql"
	"github.com/satori/go.uuid"
	"time"
)

type PublicKey struct {
	ContactId       UUID             `cql:"contact_id"       json:"contact_id"`
	DateInsert      time.Time        `cql:"date_insert"      json:"date_insert"`
	DateUpdate      time.Time        `cql:"date_update"      json:"date_update"`
	ExpireDate      time.Time        `cql:"expire_date"      json:"expire_date"`
	Fingerprint     string           `cql:"fingerprint"      json:"fingerprint"`
	Key             string           `cql:"key"              json:"key"`
	Name            string           `cql:"name"             json:"name"`
	PrivacyFeatures *PrivacyFeatures `cql:"privacy_features" json:"privacy_features"`
	Size            int              `cql:"size"             json:"size"`
	UserId          UUID             `cql:"user_id"          json:"user_id"`
}

// unmarshal a map[string]interface{} that must owns all PublicKey's fields
// typical usage is for unmarshaling response from Cassandra backend
func (pk *PublicKey) UnmarshalCQLMap(input map[string]interface{}) {
	contactId, _ := input["contact_id"].(gocql.UUID)
	pk.ContactId.UnmarshalBinary(contactId.Bytes())
	pk.DateInsert, _ = input["date_insert"].(time.Time)
	pk.DateUpdate, _ = input["date_update"].(time.Time)
	pk.ExpireDate, _ = input["expire_date"].(time.Time)
	pk.Fingerprint, _ = input["fingerprint"].(string)
	pk.Key, _ = input["key"].(string)
	pk.Name, _ = input["name"].(string)
	if i_pf, ok := input["privacy_features"].(map[string]string); ok {
		pf := PrivacyFeatures{}
		for k, v := range i_pf {
			pf[k] = v
		}
		pk.PrivacyFeatures = &pf

	} else {
		pk.PrivacyFeatures = nil
	}
	pk.Size, _ = input["size"].(int)
	userid, _ := input["user_id"].(gocql.UUID)
	pk.UserId.UnmarshalBinary(userid.Bytes())
}

func (pk *PublicKey) UnmarshalMap(input map[string]interface{}) error {
	if contact_id, ok := input["contact_id"].(string); ok {
		if id, err := uuid.FromString(contact_id); err == nil {
			pk.ContactId.UnmarshalBinary(id.Bytes())
		}
	}
	if date, ok := input["date_insert"]; ok {
		pk.DateInsert, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	if date, ok := input["date_update"]; ok {
		pk.DateUpdate, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	if date, ok := input["expire_date"]; ok {
		pk.ExpireDate, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	pk.Fingerprint, _ = input["fingerprint"].(string)
	pk.Key, _ = input["key"].(string)
	pk.Name, _ = input["name"].(string)

	if pf, ok := input["privacy_features"]; ok {
		PF := PrivacyFeatures{}
		PF = pf.(map[string]string)
		pk.PrivacyFeatures = &PF
	}
	pk.Size, _ = input["size"].(int)
	if u_id, ok := input["user_id"].(string); ok {
		if id, err := uuid.FromString(u_id); err == nil {
			pk.UserId.UnmarshalBinary(id.Bytes())
		}
	}

	return nil //TODO : errors handling
}
