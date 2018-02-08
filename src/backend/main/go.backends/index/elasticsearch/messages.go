// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package index

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/satori/go.uuid"
	"gopkg.in/oleiade/reflections.v1"
	"strings"
)

func (es *ElasticSearchBackend) CreateMessage(user *objects.UserInfo, msg *objects.Message) error {

	es_msg, err := msg.MarshalES()
	if err != nil {
		return err
	}

	resp, err := es.Client.Index().Index(user.Shard_id).Type(objects.MessageIndexType).Id(msg.Message_id.String()).
		BodyString(string(es_msg)).
		Refresh("wait_for").
		Do(context.TODO())
	if err != nil {
		log.WithError(err).Warn("backend Index: IndexMessage operation failed")
		return err
	}
	log.Infof("New msg indexed with id %s", resp.Id)
	return nil

}

func (es *ElasticSearchBackend) UpdateMessage(user *objects.UserInfo, msg *objects.Message, fields map[string]interface{}) error {

	//get json field name for each field to modify
	jsonFields := map[string]interface{}{}
	for field, value := range fields {
		jsonField, err := reflections.GetFieldTag(msg, field, "json")
		if err != nil {
			return fmt.Errorf("[ElasticSearchBackend] UpdateMessage failed to find a json field for object field %s", field)
		}
		split := strings.Split(jsonField, ",")
		jsonFields[split[0]] = value
	}

	update, err := es.Client.Update().Index(user.Shard_id).Type(objects.MessageIndexType).Id(msg.Message_id.String()).
		Doc(fields).
		Refresh("wait_for").
		Do(context.TODO())
	if err != nil {
		log.WithError(err).Warn("backend Index: updateMessage operation failed")
		return err
	}
	log.Infof("New version of indexed msg %s is now %d", update.Id, update.Version)
	return nil
}

func (es *ElasticSearchBackend) SetMessageUnread(user *objects.UserInfo, message_id string, status bool) (err error) {
	payload := struct {
		Is_unread bool `json:"is_unread"`
	}{status}

	update := es.Client.Update().Index(user.Shard_id).Type(objects.MessageIndexType).Id(message_id)
	_, err = update.Doc(payload).Refresh("true").Do(context.TODO())

	return
}

func (es *ElasticSearchBackend) FilterMessages(filter objects.IndexSearch) (messages []*objects.Message, totalFound int64, err error) {

	search := es.Client.Search().Index(filter.Shard_id).Type(objects.MessageIndexType)
	search = filter.FilterQuery(search, true).Sort("date_insert", false)

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
		msg := new(objects.Message).NewEmpty().(*objects.Message)
		if err := json.Unmarshal(*hit.Source, msg); err != nil {
			log.Info(err)
			continue
		}
		msg_id, _ := uuid.FromString(hit.Id)
		msg.Message_id.UnmarshalBinary(msg_id.Bytes())
		messages = append(messages, msg)
	}
	totalFound = result.TotalHits()
	return
}
