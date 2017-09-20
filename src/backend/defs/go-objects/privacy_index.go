// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import "time"

type PrivacyIndex struct {
	Comportment int       `cql:"comportment"    json:"comportment"`
	Context     int       `cql:"context"        json:"context"`
	DateUpdate  time.Time `cql:"date_update"    json:"date_update"`
	Technic     int       `cql:"technic"        json:"technic"`
	Version     int       `cql:"version"        json:"version"`
}

func (pi *PrivacyIndex) UnmarshalMap(input map[string]interface{}) error {

	pi.Comportment, _ = input["comportment"].(int)
	pi.Context, _ = input["context"].(int)
	if date, ok := input["date_update"]; ok {
		pi.DateUpdate, _ = time.Parse(time.RFC3339Nano, date.(string))
	}
	pi.Technic, _ = input["technic"].(int)
	pi.Version, _ = input["version"].(int)

	return nil //TODO: errors handling
}
