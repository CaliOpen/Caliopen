// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package index

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/satori/go.uuid"
	"gopkg.in/oleiade/reflections.v1"
	"strings"
)

func (es *ElasticSearchBackend) CreateContact(contact *Contact) error {
	es_contact, err := contact.MarshelES()
	if err != nil {
		log.WithError(err).Warn("[ElasticSearchBackend] failed to parse contact to json : %s", string(es_contact))
		return err
	}
	resp, err := es.Client.Index().Index(contact.UserId.String()).Type(ContactIndexType).Id(contact.ContactId.String()).
		BodyString(string(es_contact)).
		Do(context.TODO())
	if err != nil {
		log.WithError(err).Warnf("[ElasticSearchBackend] CreateContact failed for user %s and contact %s", contact.UserId.String(), contact.ContactId.String())
		return err
	}
	log.Infof("New msg indexed with id %s", resp.Id)
	return nil
}

func (es *ElasticSearchBackend) UpdateContact(user *UserInfo, contact *Contact, fields map[string]interface{}) error {

	//get json field name for each field to modify
	jsonFields := map[string]interface{}{}
	for field, value := range fields {
		jsonField, err := reflections.GetFieldTag(contact, field, "json")
		if err != nil {
			return fmt.Errorf("[ElasticSearchBackend] UpdateContact failed to find a json field for object field %s", field)
		}
		split := strings.Split(jsonField, ",")
		jsonFields[split[0]] = value
	}
	update, err := es.Client.Update().Index(user.Shard_id).Type(ContactIndexType).Id(contact.ContactId.String()).
		Doc(fields).
		Refresh("wait_for").
		Do(context.TODO())
	if err != nil {
		log.WithError(err).Warn("[ElasticSearchBackend] updateContact operation failed")
		return err
	}
	log.Infof("New version of indexed contact %s is now %d", update.Id, update.Version)
	return nil
}

func (es *ElasticSearchBackend) DeleteContact(contact *Contact) error {
	_, err := es.Client.Delete().Index(contact.UserId.String()).Type(ContactIndexType).Id(contact.ContactId.String()).Do(context.TODO())
	if err != nil {
		return err
	}
	return nil
}

func (es *ElasticSearchBackend) SetContactUnread(user_id, Contact_id string, status bool) (err error) {
	return errors.New("[ElasticSearchBackend] not implemented")
}

func (es *ElasticSearchBackend) FilterContacts(filter IndexSearch) (contacts []*Contact, totalFound int64, err error) {
	search := es.Client.Search().Index(filter.User_id.String()).Type(ContactIndexType)
	search = filter.FilterQuery(search, false).Sort("title.raw", true)

	if filter.Offset > 0 {
		search = search.From(filter.Offset)
	}
	if filter.Limit > 0 {
		search = search.Size(filter.Limit)
	}

	result, err := search.Do(context.TODO())

	if err != nil {
		return nil, 0, err
	}

	for _, hit := range result.Hits.Hits {
		contact := new(Contact).NewEmpty().(*Contact)
		if err := json.Unmarshal(*hit.Source, contact); err != nil {
			log.Info(err)
			continue
		}
		contact_id, _ := uuid.FromString(hit.Id)
		contact.ContactId.UnmarshalBinary(contact_id.Bytes())
		contact.UserId = filter.User_id
		contacts = append(contacts, contact)
	}
	totalFound = result.TotalHits()
	return
}
