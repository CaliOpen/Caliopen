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

func (cb *CassandraBackend) CreateRemoteIdentity(rId *RemoteIdentity) error {

	ridT := cb.IKeyspace.Table("remote_identity", &RemoteIdentity{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "identifier"},
	}).WithOptions(gocassa.Options{TableName: "remote_identity"})

	//save remote identity
	err := ridT.Set(rId).Run()
	if err != nil {
		return fmt.Errorf("[CassandraBackend] CreateRemoteIdentity: %s", err)
	}

	return nil
}

func (cb *CassandraBackend) RetrieveRemoteIdentity(userId, identifier string) (rId *RemoteIdentity, err error) {

	rId = new(RemoteIdentity)
	m := map[string]interface{}{}
	q := cb.Session.Query(`SELECT * FROM remote_identity WHERE user_id = ? AND identifier = ?`, userId, identifier)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	rId.UnmarshalCQLMap(m)

	return
}

func (cb *CassandraBackend) UpdateRemoteIdentity(rId *RemoteIdentity, fields map[string]interface{}) error {
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
		PartitionKeys: []string{"user_id", "identifier"},
	}).WithOptions(gocassa.Options{TableName: "remote_identity"})

	return ridT.Where(gocassa.Eq("user_id", rId.UserId.String()), gocassa.Eq("identifier", rId.Identifier)).
		Update(cassaFields).Run()
}

func (cb *CassandraBackend) RetrieveRemoteIdentities(userId string) (rIds []*RemoteIdentity, err error) {
	err = errors.New("[cassandra backend] RetrieveRemoteIdentities not implemented")
	all_ids, err := cb.Session.Query(`SELECT * FROM remote_identity WHERE user_id = ?`, userId).Iter().SliceMap()
	if err != nil {
		return
	}
	if len(all_ids) == 0 {
		err = errors.New("ids not found")
	}
	for _, identity := range all_ids {
		id := new(RemoteIdentity).NewEmpty().(*RemoteIdentity)
		id.UnmarshalCQLMap(identity)
		rIds = append(rIds, id)
	}
	return
}

// RetrieveAllRemotes returns a chan to range over all remote identities found in db
func (cb *CassandraBackend) RetrieveAllRemotes() (<-chan *RemoteIdentity, error) {

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
			rId.SetDefaultInfos()
			rId.UnmarshalCQLMap(remoteID)
			select {
			case ch <- rId:
			case <-time.After(cb.Timeout):
				logrus.Warn("[RetrieveAllRemote] write timeout on chan")
			}
		}

		close(ch)
	}(cb, ch)

	return ch, nil
}
