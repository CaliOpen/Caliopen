// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// UserStorage interface implementation for cassandra backend

package store

import (
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/gocql/gocql"
)

func (cb *CassandraBackend) Get(*User) error {
	return errors.New("[CassandraBackend] Get not implemented")
}

func (cb *CassandraBackend) GetLocalsIdentities(user_id string) (identities []LocalIdentity, err error) {
	user_identities := make(map[string]interface{})
	err = cb.Session.Query(`SELECT local_identities from user where user_id = ?`, user_id).MapScan(user_identities)
	if err != nil {
		return
	}
	if user_identities["local_identities"] == nil {
		err = errors.New("[cassandra] : local identities lookup returns empty")
		return
	}
	for _, identifier := range user_identities["local_identities"].([]string) {
		i := make(map[string]interface{})
		cb.Session.Query(`SELECT * FROM local_identity where identifier = ?`, identifier).MapScan(i)
		identity := LocalIdentity{
			Display_name: i["display_name"].(string),
			Identifier:   i["identifier"].(string),
			Status:       i["status"].(string),
			Type:         i["type"].(string),
		}
		identity.User_id.UnmarshalBinary(i["user_id"].(gocql.UUID).Bytes())
		identities = append(identities, identity)
	}

	return
}
