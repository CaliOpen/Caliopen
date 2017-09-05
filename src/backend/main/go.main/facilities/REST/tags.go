package REST

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/pkg/errors"
)

func (rest *RESTfacility) RetrieveUserTags(user_id string) (tags []Tag, err error) {
	return rest.store.RetrieveUserTags(user_id)
}

// adds the tag in db for user if it doesn't exist yet
// modifies tag in-place to add its generated tag_id
func (rest *RESTfacility) CreateTag(tag *Tag) error {
	return rest.store.CreateTag(tag)
}

func (rest *RESTfacility) RetrieveTag(user_id, tag_id string) (tag Tag, err error) {
	return rest.store.RetrieveTag(user_id, tag_id)
}

func (rest *RESTfacility) UpdateTag(tag *Tag) error {
	user_id := tag.User_id.String()
	tag_id := tag.Tag_id.String()
	if user_id != "" && tag_id != "" {

		db_tag, err := rest.store.RetrieveTag(user_id, tag_id)
		if err != nil {
			return err
		}
		if db_tag.Type == SystemTag {
			return errors.New("system tags can't be updated by user")
		}
		// RESTfacility allows user to only modify the name attribute
		tag.Date_insert = db_tag.Date_insert
		tag.Importance_level = db_tag.Importance_level
		return rest.store.UpdateTag(tag)

	} else {
		return errors.New("invalid tag's tag_id and/or user_id")
	}
}

func (rest *RESTfacility) DeleteTag(user_id, tag_id string) error {

	tag, err := rest.store.RetrieveTag(user_id, tag_id)
	if err != nil {
		return err
	}
	if tag.Type == SystemTag {
		return errors.New("system tags can't be deleted by user")
	}

	return rest.store.DeleteTag(user_id, tag_id)
}
