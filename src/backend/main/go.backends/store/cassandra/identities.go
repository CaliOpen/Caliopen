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
	log "github.com/Sirupsen/logrus"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
	"gopkg.in/oleiade/reflections.v1"
	"time"
)

func (cb *CassandraBackend) RetrieveLocalsIdentities(userId string) (identities []UserIdentity, err error) {
	var count int
	iter := cb.SessionQuery(`SELECT identity_id FROM identity_type_lookup WHERE type = ? AND user_id = ?`, LocalIdentity, userId).Iter()
	for {
		var identityID gocql.UUID
		if !iter.Scan(&identityID) {
			break
		}
		count++
		i := make(map[string]interface{})
		cb.SessionQuery(`SELECT * FROM user_identity WHERE user_id = ? AND identity_id = ?`, userId, identityID).MapScan(i)
		identity := new(UserIdentity)
		identity.UnmarshalCQLMap(i)
		identities = append(identities, *identity)
	}
	if count == 0 {
		err = errors.New("not found")
		return
	}
	return
}

func (cb *CassandraBackend) CreateUserIdentity(userIdentity *UserIdentity) CaliopenError {

	userIdentityTable := cb.IKeyspace.Table("user_identity", &UserIdentity{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "identity_id"},
	}).WithOptions(gocassa.Options{TableName: "user_identity"})

	// check if user identity already exist
	var count int
	err := cb.SessionQuery(`SELECT count(*) from user_identity WHERE user_id = ? AND identity_id = ?`, userIdentity.UserId, userIdentity.Id).Scan(&count)
	if err != nil {
		return WrapCaliopenErrf(err, DbCaliopenErr, "[CassandraBackend] CreateUserIdentity fails : <%s>", err.Error())
	}
	if count != 0 {
		return NewCaliopenErrf(ForbiddenCaliopenErr, "[CassandraBackend] CreateUserIdentity error : user identity <%s> already exist for user <%s>", userIdentity.Id, userIdentity.UserId.String())
	}

	// remove credentials from struct
	cred := userIdentity.Credentials
	(*userIdentity).Credentials = nil

	// create user identity
	err = userIdentityTable.Set(userIdentity).Run()
	if err != nil {
		return WrapCaliopenErrf(err, DbCaliopenErr, "[CassandraBackend] CreateUserIdentity fails : %s", err.Error())
	}

	// update lookup tables
	err = cb.UpdateLookups(userIdentity, nil, true)
	if err != nil {
		log.WithError(err).Warnf("[CassandraBackend] UpdateLookups error for UserIdentity %s (user %s)", userIdentity.Id.String(), userIdentity.UserId.String())
	}

	// create credentials apart
	if cred != nil {
		err = cb.CreateCredentials(userIdentity, *cred)
		if err != nil {
			return WrapCaliopenErr(err, DbCaliopenErr, "[CassandraBackend) CreateUserIdentity failed to createCredentials")
		}
	}

	return nil
}

func (cb *CassandraBackend) RetrieveUserIdentity(userId, identityId string, withCredentials bool) (userIdentity *UserIdentity, err error) {

	userIdentity = new(UserIdentity)
	m := map[string]interface{}{}
	q := cb.SessionQuery(`SELECT * FROM user_identity WHERE user_id = ? AND identity_id = ?`, userId, identityId)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	userIdentity.UnmarshalCQLMap(m)
	if withCredentials && userIdentity.Type != LocalIdentity {
		cred, err := cb.RetrieveCredentials(userId, identityId)
		if err != nil {
			return nil, err
		}
		userIdentity.Credentials = &cred
	} else {
		// discard credentials
		userIdentity.Credentials = nil
	}

	return
}

func (cb *CassandraBackend) UpdateUserIdentity(userIdentity *UserIdentity, fields map[string]interface{}) (err error) {
	// immediately prevent upsert
	if cb.SessionQuery(`SELECT user_id FROM user_identity WHERE user_id = ? AND identity_id = ?`, userIdentity.UserId.String(), userIdentity.Id.String()).Iter().NumRows() == 0 {
		return errors.New("not found")
	}
	//remove Credentials from userIdentity and process this special property apart
	if cred, ok := fields["Credentials"].(*Credentials); ok && cred != nil {
		(*userIdentity).Credentials = nil
		delete(fields, "Credentials")
		err = cb.UpdateCredentials(userIdentity.UserId.String(), userIdentity.Id.String(), *cred)
		if err != nil {
			log.WithError(err).Warn("[CassandraBackend] UpdateUserIdentity failed to update credentials")
		}
	}

	if len(fields) > 0 {
		//get cassandra's field name for each field to modify
		cassaFields := map[string]interface{}{}
		for field, value := range fields {
			cassaField, err := reflections.GetFieldTag(userIdentity, field, "cql")
			if err != nil {
				return fmt.Errorf("[CassandraBackend] UpdateUserIdentity failed to find a cql field for object field %s", field)
			}
			if cassaField != "-" {
				cassaFields[cassaField] = value
			}
		}

		userIdentityTable := cb.IKeyspace.Table("user_identity", &UserIdentity{}, gocassa.Keys{
			PartitionKeys: []string{"user_id", "identity_id"},
		}).WithOptions(gocassa.Options{TableName: "user_identity"})

		statement, values := userIdentityTable.Where(gocassa.Eq("user_id", userIdentity.UserId.String()), gocassa.Eq("identity_id", userIdentity.Id.String())).
			Update(cassaFields).GenerateStatement()

		err := cb.SessionQuery(statement+" IF EXISTS", values...).Exec()
		if err != nil {
			return err
		}

		// update lookup tables
		return cb.UpdateLookups(userIdentity, nil, false)

	}

	return err
}

// UpdateRemoteInfos is a convenient way to quickly update infos map without the need of an already created UserIdentity object
func (cb *CassandraBackend) UpdateRemoteInfosMap(userId, remoteId string, infos map[string]string) error {
	userIdentityTable := cb.IKeyspace.Table("user_identity", &UserIdentity{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "identity_id"},
	}).WithOptions(gocassa.Options{TableName: "user_identity"})

	statement, values := userIdentityTable.Where(gocassa.Eq("user_id", userId), gocassa.Eq("identity_id", remoteId)).
		Update(map[string]interface{}{
			"infos": infos,
		}).GenerateStatement()
	return cb.SessionQuery(statement+" IF EXISTS", values...).Exec()
}

// RetrieveRemoteInfos is a convenient way to quickly retrieve infos map without the need of an already created UserIdentity object
func (cb *CassandraBackend) RetrieveRemoteInfosMap(userId, remoteId string) (infos map[string]string, err error) {
	m := map[string]interface{}{}
	infos = map[string]string{}
	q := cb.SessionQuery(`SELECT infos FROM user_identity WHERE user_id = ? AND identity_id = ?`, userId, remoteId)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	for k, v := range m["infos"].(map[string]string) {
		infos[k] = v
	}
	return
}

func (cb *CassandraBackend) RetrieveRemoteIdentities(userId string, withCredentials bool) (userIdentities []*UserIdentity, err error) {
	var count int
	iter := cb.SessionQuery(`SELECT identity_id FROM identity_type_lookup WHERE type = ? AND user_id = ?`, RemoteIdentity, userId).Iter()
	for {
		var identityID gocql.UUID
		if !iter.Scan(&identityID) {
			break
		}
		count++
		i := make(map[string]interface{})
		e := cb.SessionQuery(`SELECT * FROM user_identity WHERE user_id = ? AND identity_id = ?`, userId, identityID).MapScan(i)
		if e != nil {
			log.Warnf("[CassandraBackend] RetrieveRemoteIdentities failed on inconsistency between identity_type_lookup and user_identity for user %s and identity %s", userId, identityID)
			continue
		}
		identity := new(UserIdentity)
		identity.UnmarshalCQLMap(i)
		if withCredentials {
			cred, err := cb.RetrieveCredentials(userId, identity.Id.String())
			if err != nil {
				// return user identity even if credentials retrieval failed
				cred = Credentials{}
			}
			identity.Credentials = &cred
		} else {
			// discard credentials
			identity.Credentials = nil
		}
		userIdentities = append(userIdentities, identity)
	}
	if count == 0 {
		err = errors.New("not found")
		return
	}
	return
}

// RetrieveAllRemotes returns a chan to range over all remote identities found in db
func (cb *CassandraBackend) RetrieveAllRemotes(withCredentials bool) (<-chan *UserIdentity, error) {

	ch := make(chan *UserIdentity)
	go func(cb *CassandraBackend, ch chan *UserIdentity) {
		iter := cb.SessionQuery(`SELECT user_id, identity_id from identity_type_lookup WHERE type = ?`, RemoteIdentity).Iter()

		for {
			var userId, identityId gocql.UUID
			if !iter.Scan(&userId, &identityId) {
				break
			}
			userIdentity, err := cb.RetrieveUserIdentity(userId.String(), identityId.String(), withCredentials)
			if err != nil {
				log.WithError(err).Warnf("[CassandraBackend]RetrieveAllRemotes fails to retrieve identity for user %s and identity_id %", userId.String(), identityId.String())
				continue
			}
			if withCredentials {
				cred, err := cb.RetrieveCredentials(userIdentity.UserId.String(), userIdentity.Id.String())
				if err != nil {
					userIdentity.Credentials = &cred
				} else {
					userIdentity.Credentials = nil
				}
			} else {
				userIdentity.Credentials = nil
			}

			select {
			case ch <- userIdentity:
			case <-time.After(cb.Timeout):
				log.Warn("[RetrieveAllRemote] write timeout on chan")
			}
		}

		iter.Close()
		close(ch)
	}(cb, ch)

	return ch, nil
}

func (cb *CassandraBackend) DeleteUserIdentity(userIdentity *UserIdentity) error {
	if cb.UseVault {
		err := cb.Vault.DeleteCredentials(userIdentity.UserId.String(), userIdentity.Id.String())
		if err != nil {
			log.WithError(err).Warn("[CassandraBackend] DeleteUserIdentity failed to delete credentials in vault")
		}
	}
	// delete related rows in relevant lookup tables
	err := cb.DeleteLookups(userIdentity)
	if err != nil {
		log.WithError(err).Error("[CassandraBackend] DeleteUserIdentity: failed to delete lookups")
	}
	return cb.SessionQuery(`DELETE FROM user_identity WHERE user_id = ? AND identity_id = ?`, userIdentity.UserId, userIdentity.Id).Exec()
}

// LookupIdentityByIdentifier retrieve one or more identity_id depending on given parameters :
// an identifier (mandatory)
// other params could be protocol string, user_id string
// returns an array of [user_id, identity_id]
func (cb *CassandraBackend) LookupIdentityByIdentifier(identifier string, params ...string) (identities [][2]string, err error) {
	if identifier == "" {
		err = errors.New("identifier is mandatory")
		return
	}
	var rows []map[string]interface{}
	switch len(params) {
	case 0:
		rows, err = cb.SessionQuery(`SELECT * from identity_lookup WHERE identifier = ?`, identifier).Iter().SliceMap()
		if err != nil {
			return
		}
	case 1:
		rows, err = cb.SessionQuery(`SELECT * from identity_lookup WHERE identifier = ? AND protocol = ?`,
			identifier, params[0]).Iter().SliceMap()
		if err != nil {
			return
		}
	case 2:
		rows, err = cb.SessionQuery(`SELECT * from identity_lookup WHERE identifier = ? AND protocol = ? AND user_id = ?`,
			identifier, params[0], params[1]).Iter().SliceMap()
		if err != nil {
			return
		}
	default:
		err = errors.New("too many params provided")
		return
	}
	for _, row := range rows {
		identities = append(identities, [2]string{
			row["user_id"].(gocql.UUID).String(),
			row["identity_id"].(gocql.UUID).String(),
		})
	}
	return
}

// LookupIdentityByType retrieve one or more identity_id depending on given parameters :
// a type (mandatory)
// a user_id (optional)
// returns an array of [user_id, identity_id]
func (cb *CassandraBackend) LookupIdentityByType(identityType string, user_id ...string) (identities [][2]string, err error) {
	if identityType == "" {
		err = errors.New("identity type is mandatory")
		return
	}
	var rows []map[string]interface{}
	switch len(user_id) {
	case 0:
		rows, err = cb.SessionQuery(`SELECT * from identity_type_lookup WHERE type = ?`, identityType).Iter().SliceMap()
		if err != nil {
			return
		}
	case 1:
		rows, err = cb.SessionQuery(`SELECT * from identity_type_lookup WHERE type = ? AND user_id = ?`, identityType, user_id[0]).Iter().SliceMap()
		if err != nil {
			return
		}
	default:
		err = errors.New("too many user_id provided")
		return
	}
	for _, row := range rows {
		identities = append(identities, [2]string{
			row["user_id"].(gocql.UUID).String(),
			row["identity_id"].(gocql.UUID).String(),
		})
	}
	return
}

// IsLocalIdentity is helper to make a lookup query in cassandra and check if a UserIdentity is "local"
// return true only if identity has been found and is local
func (cb *CassandraBackend) IsLocalIdentity(userId, identityId string) bool {
	var identityType string
	err := cb.SessionQuery(`SELECT type FROM user_identity WHERE user_id = ? AND identity_id = ?`, userId, identityId).Scan(&identityType)
	if err != nil || identityType != LocalIdentity {
		return false
	}
	return true
}

// IsRemoteIdentity is helper to make a lookup query in cassandra and check if a UserIdentity is "local"
// return true only if identity has been found and is local
func (cb *CassandraBackend) IsRemoteIdentity(userId, identityId string) bool {
	var identityType string
	err := cb.SessionQuery(`SELECT type FROM user_identity WHERE user_id = ? AND identity_id = ?`, userId, identityId).Scan(&identityType)
	if err != nil || identityType != RemoteIdentity {
		return false
	}
	return true
}

// TimestampRemoteLastCheck writes timestamp to user_identity.last_check property.
// If no time is provided defaults to time.Now()
func (cb *CassandraBackend) TimestampRemoteLastCheck(userId, remoteId string, t ...time.Time) error {
	var timestamp time.Time
	if len(t) < 1 {
		timestamp = time.Now()
	} else {
		timestamp = t[0]
	}
	return cb.SessionQuery(`UPDATE user_identity SET last_check = ? WHERE user_id = ? AND identity_id = ? IF EXISTS`, timestamp, userId, remoteId).Exec()
}
