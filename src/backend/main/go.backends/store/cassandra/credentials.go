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

func (cb *CassandraBackend) CreateCredentials(rId *RemoteIdentity, cred Credentials) error {

	if cb.UseVault {
		return cb.Vault.CreateCredentials(rId, cred)
	}

	//(re)embed credentials into RemoteIdentity that has already been created
	(*rId).Credentials = cred
	return cb.UpdateRemoteIdentity(rId, map[string]interface{}{
		"Credentials": cred,
	})
}

func (cb *CassandraBackend) RetrieveCredentials(userId, remoteId string) (cred Credentials, err error) {

	if cb.UseVault {
		return cb.Vault.RetrieveCredentials(userId, remoteId)
	}

	err = cb.Session.Query(`SELECT credentials FROM remote_identity WHERE user_id = ? AND remote_id = ?`, userId, remoteId).Scan(&cred)

	return
}

func (cb *CassandraBackend) UpdateCredentials(userId, remoteId string, cred Credentials) error {

	if cb.UseVault {
		return cb.Vault.UpdateCredentials(userId, remoteId, cred)
	}

	ridT := cb.IKeyspace.Table("remote_identity", &RemoteIdentity{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "remote_id"},
	}).WithOptions(gocassa.Options{TableName: "remote_identity"})

	return ridT.Where(gocassa.Eq("user_id", userId), gocassa.Eq("remote_id", remoteId)).
		Update(map[string]interface{}{
			"credentials": cred,
		}).Run()
}

func (cb *CassandraBackend) DeleteCredentials(userId, remoteId string) error {

	if cb.UseVault {
		return cb.Vault.DeleteCredentials(userId, remoteId)
	}

	return cb.UpdateCredentials(userId, remoteId, Credentials{})

	return nil
}
