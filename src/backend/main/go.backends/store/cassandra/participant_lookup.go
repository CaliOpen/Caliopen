// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package store

import (
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/gocassa/gocassa"
	"strings"
)

func (cb *CassandraBackend) RetrieveParticipantLookup(user_id UUID, identifier, typ string) (lookup *ParticipantLookup, err error) {

	// retrieve participant lookup
	lookup = new(ParticipantLookup)
	m := map[string]interface{}{}
	clean_id := strings.ToLower(identifier)
	q := cb.SessionQuery(`SELECT * FROM participant_lookup WHERE user_id = ? AND identifier = ? AND type = ?`, user_id, clean_id, typ)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	lookup.UnmarshalCQLMap(m)
	return
}

func (cb *CassandraBackend) CreateParticipantLookup(participant *ParticipantLookup) error {
	lookupT := cb.IKeyspace.Table("participant_lookup", &ParticipantLookup{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "identifier", "type"},
	}).WithOptions(gocassa.Options{TableName: "participant_lookup"}) // need to overwrite default gocassa table naming convention

	// save lookup
	err := lookupT.Set(participant).Run()
	if err != nil {
		return fmt.Errorf("[CassandraBackend] CreateParticipantLookup: %s", err)
	}
	return nil
}
