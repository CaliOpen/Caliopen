// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// UserStorage interface implementation for cassandra backend

package store

import (
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
)

func (cb *CassandraBackend) RetrieveUser(user_id string) (user *User, err error) {
	u, err := cb.Session.Query(`SELECT * FROM user WHERE user_id = ?`, user_id).Iter().SliceMap()
	if err != nil {
		return nil, err
	}
	if len(u) != 1 {
		err = errors.New("[CassandraBackend] user not found")
		return nil, err
	}
	user = new(User)
	user.UnmarshalCQLMap(u[0])
	return user, nil
}

func (cb *CassandraBackend) UpdateUser(user *User, fields map[string]interface{}) error {

	userT := cb.IKeyspace.Table("user", &User{}, gocassa.Keys{
		PartitionKeys: []string{"user_id"},
	}).WithOptions(gocassa.Options{TableName: "user"})

	return userT.Where(gocassa.Eq("user_id", user.UserId.String())).Update(fields).Run()
}

func (cb *CassandraBackend) UpdateUserPasswordHash(user *User) error {
	return cb.Session.Query(`UPDATE user SET password = ?, privacy_features = ? WHERE user_id = ?`,
		user.Password,
		user.PrivacyFeatures,
		user.UserId,
	).Exec()
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

// UserByRecoveryEmail lookups table user_recovery_email to get the user_id for the given email
// if a user_id is found, the user is fetched from user table.
func (cb *CassandraBackend) UserByRecoveryEmail(email string) (user *User, err error) {
	user_id := new(gocql.UUID)
	err = cb.Session.Query(`SELECT user_id FROM user_recovery_email WHERE recovery_email = ?`, email).Scan(user_id)
	if err != nil || len(user_id.Bytes()) == 0 {
		return nil, err
	}
	return cb.RetrieveUser(user_id.String())
}
