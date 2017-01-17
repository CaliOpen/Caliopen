// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// UserNameStorage interface implementation for cassandra

package store

import (
	log "github.com/Sirupsen/logrus"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.main/helpers"
	"github.com/gocql/gocql"
	"github.com/gocassa/gocassa"
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
)

func (cb *CassandraBackend) IsAvailable (username string) (resp bool, err error) {
	lookup := helpers.EscapeUsername(username)
	found := map[string]interface{}{}
	err = cb.Session.Query(`SELECT COUNT(*) FROM user_name WHERE name = ?`, lookup).MapScan(found)
	if err != nil {
		log.WithError(err).Infof("username lookup error : %v", err)
		return
	}
	if found["count"].(int64) != 0 {
		return
	}
	resp = true
	return
}

// part of LDABackend interface implementation
// return a list of users' emails found in user_name table for the given recipients list
// TODO : modify this lookup as user_name table should be replaced by an 'aliases' table
func (cb *CassandraBackend) GetRecipients(rcpts []string) (user_ids []string, err error) {
	userTable := cb.IKeyspace.MapTable("user_name", "name", &obj.UserName{})
	consistency := gocql.Consistency(cb.CassandraConfig.Consistency)

	// need to overwrite default gocassa naming convention that add `_map_name` to the mapTable name
	userTable = userTable.WithOptions(gocassa.Options{
		TableName:   "user_name",
		Consistency: &consistency,
	})

	result := obj.UserName{}
	for _, rcpt := range rcpts {
		err = userTable.Read(rcpt, &result).Run()
		if err != nil {
			log.WithError(err).Infoln("error on userTable query")
			return
		}
		uuid, err := gocql.UUIDFromBytes(result.User_id)
		if err != nil {
			return []string{}, err
		}
		user_ids = append(user_ids, uuid.String())
	}
	return
}