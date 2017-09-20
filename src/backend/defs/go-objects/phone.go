// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import "github.com/satori/go.uuid"

// contacts' phone model
type Phone struct {
	IsPrimary bool   `cql:"is_primary"  json:"is_primary"`
	Number    string `cql:"number"      json:"number"`
	PhoneId   UUID   `cql:"phone_id"    json:"phone_id"`
	Type      string `cql:"type"        json:"type"`
	Uri       string `cql:"uri"         json:"uri"` //RFC3966
}

func (p *Phone) UnmarshalMap(input map[string]interface{}) error {
	p.IsPrimary, _ = input["is_primary"].(bool)
	p.Number, _ = input["number"].(string)
	if p_id, ok := input["phone_id"].(string); ok {
		if id, err := uuid.FromString(p_id); err == nil {
			p.PhoneId.UnmarshalBinary(id.Bytes())
		}
	}
	p.Type, _ = input["type"].(string)
	p.Uri, _ = input["uri"].(string)
	return nil //TODO : errors handling
}
