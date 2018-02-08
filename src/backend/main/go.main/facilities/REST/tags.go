package REST

import (
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/helpers"
	"github.com/bitly/go-simplejson"
	"github.com/mozillazg/go-unidecode"
	"strings"
)

func (rest *RESTfacility) RetrieveUserTags(user_id string) (tags []Tag, err CaliopenError) {
	tags, e := rest.store.RetrieveUserTags(user_id)
	if e != nil {
		return tags, WrapCaliopenErr(e, DbCaliopenErr, "[RESTfacility] RetrieveUserTags failed")
	}
	return tags, nil
}

// CreateTag :
// - ensures tag's label is unique
// - copies tag's name to tag's label
// - converts tag's name to lower & ASCII and replace spaces by "_"
// - adds the tag in db for user if it doesn't exist yet
// - updates tag in-place with its new properties
func (rest *RESTfacility) CreateTag(tag *Tag) CaliopenError {
	var isUnique bool
	var err error
	isUnique, tag.Name, err = rest.IsTagLabelNameUnique(tag.Label, tag.User_id.String())
	if err != nil {
		return WrapCaliopenErr(err, UnprocessableCaliopenErr, "[RESTfacility] CreateTag failed to check tag's uniqueness")
	}
	if !isUnique {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[RESTfacility] tag's name/label conflict with existing one")
	}

	err = rest.store.CreateTag(tag)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] CreateTag failded to CreateTag in store")
	}
	return nil
}

func (rest *RESTfacility) RetrieveTag(user_id, tag_name string) (tag Tag, err CaliopenError) {
	tag, e := rest.store.RetrieveTag(user_id, tag_name)
	if e != nil {
		return tag, WrapCaliopenErr(e, DbCaliopenErr, "[RESTfacility] RetrieveTag failed")
	}
	return tag, nil
}

// PatchTag is a shortcut for REST api to call two methods :
// - UpdateWithPatch () to retrieve the tag from db
// - checks that new label is not conflicting with an existing one
// - then UpdateTag() to save updated tag to stores if everything went good.
func (rest *RESTfacility) PatchTag(patch []byte, user_id, tag_name string) CaliopenError {

	current_tag, Cerr := rest.RetrieveTag(user_id, tag_name)
	if Cerr != nil {
		return Cerr
	}

	// read into the patch to make basic controls before processing it with generic helper
	patchReader, err := simplejson.NewJson(patch)
	if err != nil {
		return WrapCaliopenErrf(err, FailDependencyCaliopenErr, "[RESTfacility] PatchTag failed with simplejson error : %s", err)
	}
	label := patchReader.Get("label").MustString()
	if label == "" || strings.Replace(label, " ", "", -1) == "" {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[RESTfacility] new tag's label is empty")
	}
	isUnique, name, err := rest.IsTagLabelNameUnique(label, user_id)
	if err != nil {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[RESTfacility] tag's name/label conflict with existing one")
	}
	if !isUnique && name != tag_name {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[RESTfacility] tag's name/label conflict with existing one")
	}

	// patch seams OK, apply it to the resource
	newTag, _, err := helpers.UpdateWithPatch(patch, &current_tag, UserActor)
	if err != nil {
		return WrapCaliopenErrf(err, FailDependencyCaliopenErr, "[RESTfacility] PatchTag failed with UpdateWithPatch error : %s", err)
	}

	// save updated resource
	err = rest.UpdateTag(newTag.(*Tag))
	if err != nil {
		return WrapCaliopenErrf(err, FailDependencyCaliopenErr, "[RESTfacility] PatchTag failed with UpdateTag error : %s", err)
	}

	return nil
}

// UpdateTag updates a tag in store with payload,
func (rest *RESTfacility) UpdateTag(tag *Tag) CaliopenError {
	user_id := tag.User_id.String()
	if user_id != "" && tag.Name != "" {
		db_tag, err := rest.store.RetrieveTag(user_id, tag.Name)
		if err != nil {
			return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateTag failed to RetrieveTag from store")
		}
		// RESTfacility allows user to only modify label and importance_level properties
		// thus squash other properties with those from db to ignore any modifications
		tag.Date_insert = db_tag.Date_insert
		tag.Name = db_tag.Name
		tag.Type = db_tag.Type
		tag.User_id = db_tag.User_id
		err = rest.store.UpdateTag(tag)
		if err != nil {
			return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateTag failed to UpdateTag in store")
		}

	} else {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[RESTfacility] invalid tag's name and/or user_id")
	}
	return nil
}

// DeleteTag deletes a tag in store,
// only if tag is a user tag.
func (rest *RESTfacility) DeleteTag(user_id, tag_name string) CaliopenError {

	tag, err := rest.store.RetrieveTag(user_id, tag_name)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] DeleteTag failed to retrieve tag")
	}
	if tag.Type == SystemTag {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[RESTfacility] system tags can't be deleted by user")
	}

	err = rest.store.DeleteTag(user_id, tag_name)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] DeleteTag failed to DeleteTag in store")
	}
	go rest.deleteEmbeddedTagReferences(user_id, tag_name)
	return nil
}

// UpdateResourceTags :
// - checks that tag_names within patch belong to user and are unique,
// - calls generic UpdateWithPatch func to patch the resource,
// - saves and indexes updated resource.
// It is caller responsibility to call this func with a well-formed patch that has only "tags" properties
func (rest *RESTfacility) UpdateResourceTags(user *UserInfo, resourceID, resourceType string, patch []byte) CaliopenError {
	var err error
	// 1. check that tag_names within patch belong to user and are unique
	tags, err := rest.RetrieveUserTags(user.User_id)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateResourceTags error")
	}
	userTagsMap := make(map[string]bool)
	for _, tag := range tags {
		userTagsMap[tag.Name] = true
	}

	p, err := simplejson.NewJson(patch)
	if err != nil {
		return WrapCaliopenErr(err, UnknownCaliopenErr, "[RESTfacility] UpdateResourceTags simplejson error")
	}
	deduplicatedTagsList := []string{}
	patchTagsMap := make(map[string]bool)
	for _, tag := range p.Get("tags").MustStringArray() {
		// is tag belonging to user ?
		if _, ok := userTagsMap[tag]; !ok {
			err = fmt.Errorf("[RESTfacility] UpdateResourceTags : tag with name <%s> does not belong to user <%s>", tag, user.User_id)
			break
		}
		// is tag unique ?
		if _, ok := patchTagsMap[tag]; !ok {

			patchTagsMap[tag] = true
			deduplicatedTagsList = append(deduplicatedTagsList, tag)
		}
	}
	if err != nil {
		return WrapCaliopenErr(err, UnknownCaliopenErr, "[RESTfacility] UpdateResourceTags")
	}

	p.Set("tags", deduplicatedTagsList)

	patch, _ = p.MarshalJSON()
	// 2. call generic UpdateWitchPatch func
	var obj ObjectPatchable
	var newObj ObjectPatchable

	switch resourceType {
	case MessageType:
		m, err := rest.store.RetrieveMessage(user.User_id, resourceID)
		if err != nil {
			return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateResourceTags")
		}
		obj = ObjectPatchable(m)
	case ContactType:
		c, err := rest.store.RetrieveContact(user.User_id, resourceID)
		if err != nil {
			return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateResourceTags")
		}
		obj = ObjectPatchable(c)
	default:
		return NewCaliopenErr(UnknownCaliopenErr, "[RESTfacility] UpdateResourceWithPatch : invalid resourceType")
	}

	newObj, _, err = helpers.UpdateWithPatch(patch, obj, SystemActor)
	if err != nil {
		return WrapCaliopenErr(err, UnknownCaliopenErr, "[RESTfacility] UpdateResourceTags : helpers.UpdateWithPatch failed")
	}

	// 3. store and index updated resource
	switch resourceType {
	case MessageType:
		update := map[string]interface{}{
			"Tags": newObj.(*Message).Tags,
		}
		err := rest.store.UpdateMessage(newObj.(*Message), update)
		if err != nil {
			return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateResourceTags")
		}

		err = rest.index.UpdateMessage(user, obj.(*Message), update)
		if err != nil {
			return WrapCaliopenErr(err, IndexCaliopenErr, "[RESTfacility] UpdateResourceTags")
		}
	case ContactType:
		update := map[string]interface{}{
			"Tags": newObj.(*Contact).Tags,
		}
		err := rest.store.UpdateContact(newObj.(*Contact), obj.(*Contact), update)
		if err != nil {
			return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateResourceTags")
		}

		err = rest.index.UpdateContact(user, newObj.(*Contact), update)
		if err != nil {
			return WrapCaliopenErr(err, IndexCaliopenErr, "[RESTfacility] UpdateResourceTags")
		}
	}

	return nil
}

// IsTagLabelNameUnique ensures that a name and/or label is not conflicting with a name/label of another tag.
// returns :
//  - true if name/label is unique, along with the labelname normalized to a string that could be used as new tag's slug.
//  - false if name/label already exists, along with the slug that conflict with
func (rest *RESTfacility) IsTagLabelNameUnique(labelname, userID string) (bool, string, error) {
	slug := utf8ToASCIILowerNoSpace(labelname)
	tags, err := rest.store.RetrieveUserTags(userID)
	if err != nil {
		return false, "", err
	}
	for _, t := range tags {
		if t.Name == slug || t.Label == slug || t.Label == labelname {
			return false, slug, nil
		}
	}
	return true, slug, nil
}

func (rest *RESTfacility) deleteEmbeddedTagReferences(userID, tagName string) {
	//TODO : async deletion of tag references embedded into resources.
}

func utf8ToASCIILowerNoSpace(s string) string {
	b := make([]byte, len(s))
	b = []byte(unidecode.Unidecode(s))
	b = []byte(strings.ToLower(string(b)))
	b = []byte(strings.Replace(string(b), " ", "_", -1))
	return string(b)
}
