// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"encoding/json"
	"github.com/satori/go.uuid"
)

type PostalAddress struct {
	AddressId  UUID   `cql:"address_id"     json:"address_id"`
	City       string `cql:"city"           json:"city"`
	Country    string `cql:"country"        json:"country"`
	IsPrimary  bool   `cql:"is_primary"     json:"is_primary"`
	Label      string `cql:"label"          json:"label"`
	PostalCode string `cql:"postal_code"    json:"postal_code"`
	Region     string `cql:"region"         json:"region"`
	Street     string `cql:"street"         json:"street"`
	Type       string `cql:"type"           json:"type"`
}

func (pa *PostalAddress) UnmarshalJSON(b []byte) error {
	input := map[string]interface{}{}
	if err := json.Unmarshal(b, &input); err != nil {
		return err
	}

	if add_id, ok := input["address_id"].(string); ok {
		if id, err := uuid.FromString(add_id); err == nil {
			pa.AddressId.UnmarshalBinary(id.Bytes())
		}
	}
	pa.City, _ = input["city"].(string)
	pa.Country, _ = input["country"].(string)
	pa.IsPrimary, _ = input["is_primary"].(bool)
	pa.Label, _ = input["label"].(string)
	pa.PostalCode, _ = input["postal_code"].(string)
	pa.Region, _ = input["region"].(string)
	pa.Street, _ = input["street"].(string)
	pa.Type, _ = input["type"].(string)

	return nil
}

func (pa *PostalAddress) UnmarshalMap(input map[string]interface{}) error {
	if add_id, ok := input["address_id"].(string); ok {
		if id, err := uuid.FromString(add_id); err == nil {
			pa.AddressId.UnmarshalBinary(id.Bytes())
		}
	}
	pa.City, _ = input["city"].(string)
	pa.Country, _ = input["country"].(string)
	pa.IsPrimary, _ = input["is_primary"].(bool)
	pa.Label, _ = input["label"].(string)
	pa.PostalCode, _ = input["postal_code"].(string)
	pa.Region, _ = input["region"].(string)
	pa.Street, _ = input["street"].(string)
	pa.Type, _ = input["type"].(string)

	return nil //TODO: errors handling
}
