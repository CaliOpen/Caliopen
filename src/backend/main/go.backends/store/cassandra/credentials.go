/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package store

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/gocassa/gocassa"
)

func (cb *CassandraBackend) CreateCredentials(userIdentity *UserIdentity, cred Credentials) error {

	if cb.UseVault {
		return cb.Vault.CreateCredentials(userIdentity, cred)
	}

	//(re)embed credentials into UserIdentity that has already been created
	(*userIdentity).Credentials = &cred
	return cb.UpdateUserIdentity(userIdentity, map[string]interface{}{
		"Credentials": cred,
	})
}

func (cb *CassandraBackend) RetrieveCredentials(userId, identityId string) (cred Credentials, err error) {

	if cb.UseVault {
		return cb.Vault.RetrieveCredentials(userId, identityId)
	}

	err = cb.SessionQuery(`SELECT credentials FROM user_identity WHERE user_id = ? AND identity_id = ?`, userId, identityId).Scan(&cred)

	return
}

func (cb *CassandraBackend) UpdateCredentials(userId, identityId string, cred Credentials) error {

	if cb.UseVault {
		return cb.Vault.UpdateCredentials(userId, identityId, cred, false)
	}

	userIdentityTable := cb.IKeyspace.Table("user_identity", &UserIdentity{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "identity_id"},
	}).WithOptions(gocassa.Options{TableName: "user_identity"})

	statement, values := userIdentityTable.Where(gocassa.Eq("user_id", userId), gocassa.Eq("identity_id", identityId)).
		Update(map[string]interface{}{
			"credentials": cred,
		}).GenerateStatement()

	return cb.Session.Query(statement+" IF EXISTS", values...).Exec()
}

func (cb *CassandraBackend) DeleteCredentials(userId, identityId string) error {

	if cb.UseVault {
		return cb.Vault.DeleteCredentials(userId, identityId)
	}

	return cb.UpdateCredentials(userId, identityId, Credentials{})
}
