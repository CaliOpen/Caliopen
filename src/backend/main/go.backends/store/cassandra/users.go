// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// UserStorage interface implementation for cassandra backend

package store

import (
	"errors"
	"fmt"
	"time"

	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
	"gopkg.in/oleiade/reflections.v1"
)

func (cb *CassandraBackend) RetrieveUser(user_id string) (user *User, err error) {
	u, err := cb.SessionQuery(`SELECT * FROM user WHERE user_id = ?`, user_id).Iter().SliceMap()
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

	//get cassandra's field name for each field to modify
	cassaFields := map[string]interface{}{}
	for field, value := range fields {
		cassaField, err := reflections.GetFieldTag(user, field, "cql")
		if err != nil {
			return fmt.Errorf("[CassandraBackend] UpdateMessage failed to find a cql field for object field %s", field)
		}
		cassaFields[cassaField] = value
	}

	userT := cb.IKeyspace.Table("user", &User{}, gocassa.Keys{
		PartitionKeys: []string{"user_id"},
	}).WithOptions(gocassa.Options{TableName: "user"})

	return userT.Where(gocassa.Eq("user_id", user.UserId.String())).Update(cassaFields).Run()
}

func (cb *CassandraBackend) UpdateUserPasswordHash(user *User) error {
	return cb.SessionQuery(`UPDATE user SET password = ?, privacy_features = ? WHERE user_id = ?`,
		user.Password,
		user.PrivacyFeatures,
		user.UserId,
	).Exec()
}

// UserByRecoveryEmail lookups table user_recovery_email to get the user_id for the given email
// if a user_id is found, the user is fetched from user table.
func (cb *CassandraBackend) UserByRecoveryEmail(email string) (user *User, err error) {
	user_id := new(gocql.UUID)
	err = cb.SessionQuery(`SELECT user_id FROM user_recovery_email WHERE recovery_email = ?`, email).Scan(user_id)
	if err != nil || len(user_id.Bytes()) == 0 {
		return nil, err
	}
	return cb.RetrieveUser(user_id.String())
}

// DeleteUser sets the date_delete in the database
func (cb *CassandraBackend) DeleteUser(user_id string) error {
	err := cb.SessionQuery(`UPDATE user SET date_delete = ? WHERE user_id = ?`, time.Now(), user_id).Exec()
	if err != nil {
		return err
	}
	user, err := cb.RetrieveUser(user_id)
	if err != nil {
		return err
	}
	err = cb.SessionQuery(`DELETE from user_recovery_email WHERE recovery_email = ?`, user.RecoveryEmail).Exec()
	if err != nil {
		return err
	}
	return err
}

// GetShardForUser returns user's shard_id or empty string if error
func (cb *CassandraBackend) GetShardForUser(userID string) string {
	var shardID string
	err := cb.SessionQuery(`SELECT shard_id FROM user WHERE user_id = ?`, userID).Scan(&shardID)
	if err != nil {
		return ""
	}
	return shardID
}
