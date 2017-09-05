package store

import (
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/gocql/gocql"
	"time"
)

// retrieve tags of type 'user' belonging to user_id
func (cb *CassandraBackend) RetrieveUserTags(user_id string) (tags []Tag, err error) {
	all_tags, err := cb.Session.Query(`SELECT * FROM user_tag WHERE user_id = ?`, user_id).Iter().SliceMap()
	if err != nil {
		return
	}
	if len(all_tags) == 0 {
		err = errors.New("[cassandra] : user tags lookup returns empty")
		return
	}
	for _, tag := range all_tags {
		t := Tag{
			Date_insert:      tag["date_insert"].(time.Time),
			Importance_level: int32(tag["importance_level"].(int)),
			Name:             tag["name"].(string),
			Type:             TagType(tag["type"].(string)),
		}
		t.Tag_id.UnmarshalBinary(tag["tag_id"].(gocql.UUID).Bytes())
		t.User_id.UnmarshalBinary(tag["user_id"].(gocql.UUID).Bytes())
		tags = append(tags, t)
	}
	return
}

// CreateTag checks if tag's name doesn't exist for user before inserting into db.
func (cb *CassandraBackend) CreateTag(tag *Tag) error {

	user_tags, err := cb.RetrieveUserTags((*tag).User_id.String())
	if err != nil {
		return err
	}
	for _, t := range user_tags {
		if t.Name == (*tag).Name {
			return errors.New("tag name <" + t.Name + "> already exists for user.")
		}
	}
	tag_id, _ := gocql.RandomUUID()
	user_id, _ := gocql.UUIDFromBytes((*tag).User_id.Bytes())
	(*tag).Date_insert = time.Now()
	(*tag).Type = TagType(UserTag)
	(*tag).Tag_id.UnmarshalBinary(tag_id.Bytes())
	return cb.Session.Query(`INSERT INTO user_tag (user_id, tag_id, date_insert, importance_level, name, type) VALUES (?,?,?,?,?,?)`,
		user_id,
		tag_id,
		(*tag).Date_insert,
		(*tag).Importance_level,
		(*tag).Name,
		(*tag).Type).Exec()
}

func (cb *CassandraBackend) RetrieveTag(user_id, tag_id string) (tag Tag, err error) {
	tags, err := cb.Session.Query(`SELECT * FROM user_tag WHERE user_id = ? AND tag_id = ?`, user_id, tag_id).Iter().SliceMap()
	if err != nil {
		return
	}
	if len(tags) == 0 {
		err = errors.New("tag not found")
		return
	}

	tag = Tag{
		Date_insert:      tags[0]["date_insert"].(time.Time),
		Importance_level: int32(tags[0]["importance_level"].(int)),
		Name:             tags[0]["name"].(string),
		Type:             TagType(tags[0]["type"].(string)),
	}
	err = tag.Tag_id.UnmarshalBinary(tags[0]["tag_id"].(gocql.UUID).Bytes())
	err = tag.User_id.UnmarshalBinary(tags[0]["user_id"].(gocql.UUID).Bytes())
	if err != nil {
		return Tag{}, err
	}
	return
}

func (cb *CassandraBackend) UpdateTag(tag *Tag) error {
	return cb.Session.Query(`UPDATE user_tag SET date_insert = ?, importance_level = ?, name = ?, type = ? WHERE user_id = ? AND tag_id = ?`,
		tag.Date_insert,
		tag.Importance_level,
		tag.Name,
		tag.Type,
		tag.User_id,
		tag.Tag_id,
	).Exec()

}

func (cb *CassandraBackend) DeleteTag(user_id, tag_id string) error {
	return cb.Session.Query(`DELETE FROM user_tag WHERE user_id = ? AND tag_id = ?`, user_id, tag_id).Exec()
}
