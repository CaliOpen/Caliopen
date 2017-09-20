// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import "github.com/satori/go.uuid"

// contacts' organization model
type Organization struct {
	Deleted        bool   `cql:"deleted"            json:"deleted"`
	Department     string `cql:"department"         json:"department"`
	IsPrimary      bool   `cql:"is_primary"         json:"is_primary"`
	JobDescription string `cql:"job_description"    json:"job_description"`
	Label          string `cql:"label"              json:"label"`
	Name           string `cql:"name"               json:"name"`
	OrganizationId UUID   `cql:"organization_id"    json:"organization_id"`
	Title          string `cql:"title"              json:"title"`
	Type           string `cql:"type"               json:"type"`
}

func (o *Organization) UnmarshalMap(input map[string]interface{}) error {
	o.Deleted, _ = input["deleted"].(bool)
	o.Department, _ = input["department"].(string)
	o.IsPrimary, _ = input["is_primary"].(bool)
	o.JobDescription, _ = input["job_description"].(string)
	o.Label, _ = input["label"].(string)
	o.Name, _ = input["name"].(string)
	if o_id, ok := input["organization_id"].(string); ok {
		if id, err := uuid.FromString(o_id); err == nil {
			o.OrganizationId.UnmarshalBinary(id.Bytes())
		}
	}
	o.Title, _ = input["title"].(string)
	o.Type, _ = input["type"].(string)
	return nil //TODO: errors handling
}
