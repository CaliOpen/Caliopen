/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package store

import (
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/Sirupsen/logrus"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
	"gopkg.in/oleiade/reflections.v1"
	"time"
)

func (cb *CassandraBackend) RetrieveLocalsIdentities(user_id string) (identities []LocalIdentity, err error) {
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

func (cb *CassandraBackend) CreateRemoteIdentity(rId *RemoteIdentity) CaliopenError {

	ridT := cb.IKeyspace.Table("remote_identity", &RemoteIdentity{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "remote_id"},
	}).WithOptions(gocassa.Options{TableName: "remote_identity"})

	//check if remote already exist
	var count int
	err := cb.Session.Query(`SELECT count(*) from remote_identity WHERE user_id = ? AND remote_id = ?`, rId.UserId, rId.RemoteId).Scan(&count)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[CassandraBackend] CreateRemoteIdentity fails")
	}
	if count != 0 {
		return NewCaliopenErrf(ForbiddenCaliopenErr, "[CassandraBackend] CreateRemoteIdentity error : remote identity <%s> already exist for user <%s>", rId.RemoteId, rId.UserId.String())
	}

	//extract credentials from struct
	cred := rId.Credentials
	(*rId).Credentials = Credentials{}

	//create remote identity
	err = ridT.Set(rId).Run()
	if err != nil {
		return WrapCaliopenErrf(err, DbCaliopenErr, "[CassandraBackend] CreateRemoteIdentity fails : %s", err.Error())
	}

	//create credentials
	err = cb.CreateCredentials(rId, cred)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[CassandraBackend) CreateRemoteIdentity failed to createCredentials")
	}

	return nil
}

func (cb *CassandraBackend) RetrieveRemoteIdentity(userId, remoteId string, withCredentials bool) (rId *RemoteIdentity, err error) {

	rId = new(RemoteIdentity)
	m := map[string]interface{}{}
	q := cb.Session.Query(`SELECT * FROM remote_identity WHERE user_id = ? AND remote_id = ?`, userId, remoteId)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	rId.UnmarshalCQLMap(m)
	if withCredentials {
		cred, err := cb.RetrieveCredentials(userId, remoteId)
		if err != nil {
			return nil, err
		}
		rId.Credentials = cred
	} else {
		// discard credentials
		rId.Credentials = Credentials{}
	}

	return
}

func (cb *CassandraBackend) UpdateRemoteIdentity(rId *RemoteIdentity, fields map[string]interface{}) (err error) {
	//remove Credentials from rId and process this special property apart
	if cred, ok := fields["Credentials"].(Credentials); ok {
		(*rId).Credentials = Credentials{}
		delete(fields, "Credentials")
		err = cb.UpdateCredentials(rId.UserId.String(), rId.RemoteId.String(), cred)
		if err != nil {
			logrus.WithError(err).Warn("[CassandraBackend] UpdateRemoteIdentity failed to update credentials")
		}
	}

	if len(fields) > 0 {
		//get cassandra's field name for each field to modify
		cassaFields := map[string]interface{}{}
		for field, value := range fields {
			cassaField, err := reflections.GetFieldTag(rId, field, "cql")
			if err != nil {
				return fmt.Errorf("[CassandraBackend] UpdateRemoteIdentity failed to find a cql field for object field %s", field)
			}
			if cassaField != "-" {
				cassaFields[cassaField] = value
			}
		}

		ridT := cb.IKeyspace.Table("remote_identity", &RemoteIdentity{}, gocassa.Keys{
			PartitionKeys: []string{"user_id", "remote_id"},
		}).WithOptions(gocassa.Options{TableName: "remote_identity"})

		return ridT.Where(gocassa.Eq("user_id", rId.UserId.String()), gocassa.Eq("remote_id", rId.RemoteId.String())).
			Update(cassaFields).Run()
	}

	return err
}

func (cb *CassandraBackend) RetrieveRemoteIdentities(userId string, withCredentials bool) (rIds []*RemoteIdentity, err error) {
	all_ids, err := cb.Session.Query(`SELECT * FROM remote_identity WHERE user_id = ?`, userId).Iter().SliceMap()
	if err != nil {
		return
	}
	if len(all_ids) == 0 {
		err = errors.New("remote ids not found")
		return
	}
	for _, identity := range all_ids {
		id := new(RemoteIdentity).NewEmpty().(*RemoteIdentity)
		id.UnmarshalCQLMap(identity)
		if withCredentials {
			cred, err := cb.RetrieveCredentials(userId, id.RemoteId.String())
			if err != nil {
				// return remote identity even if credentials retrieval failed
				cred = Credentials{}
			}
			id.Credentials = cred
		} else {
			// discard credentials
			id.Credentials = Credentials{}
		}
		rIds = append(rIds, id)
	}
	return
}

// RetrieveAllRemotes returns a chan to range over all remote identities found in db
func (cb *CassandraBackend) RetrieveAllRemotes(withCredentials bool) (<-chan *RemoteIdentity, error) {

	ch := make(chan *RemoteIdentity)
	go func(cb *CassandraBackend, ch chan *RemoteIdentity) {
		iter := cb.Session.Query(`SELECT * from remote_identity`).Iter()

		for {
			//new map each iteration
			remoteID := make(map[string]interface{})
			if !iter.MapScan(remoteID) {
				break
			}
			rId := new(RemoteIdentity)
			rId.UnmarshalCQLMap(remoteID)
			if withCredentials {
				cred, err := cb.RetrieveCredentials(rId.UserId.String(), rId.RemoteId.String())
				if err != nil {
					rId.Credentials = cred
				} else {
					rId.Credentials = Credentials{}
				}
			} else {
				rId.Credentials = Credentials{}
			}

			select {
			case ch <- rId:
			case <-time.After(cb.Timeout):
				logrus.Warn("[RetrieveAllRemote] write timeout on chan")
			}
		}

		iter.Close()
		close(ch)
	}(cb, ch)

	return ch, nil
}

func (cb *CassandraBackend) DeleteRemoteIdentity(rId *RemoteIdentity) error {
	if cb.UseVault {
		err := cb.Vault.DeleteCredentials(rId.UserId.String(), rId.RemoteId.String())
		if err != nil {
			logrus.WithError(err).Warn("[CassandraBackend] DeleteRemoteIdentity failed to delete credentials in vault")
		}
	}
	return cb.Session.Query(`DELETE FROM remote_identity WHERE user_id = ? AND remote_id = ?`, rId.UserId, rId.RemoteId).Exec()
}
