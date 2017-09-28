// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package index

import (
	"context"
	"encoding/json"
	"github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/satori/go.uuid"
)

func (es *ElasticSearchBackend) UpdateMessage(msg *objects.Message, fields map[string]interface{}) error {

	update, err := es.Client.Update().Index(msg.User_id.String()).Type(objects.MessageIndexType).Id(msg.Message_id.String()).
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

func (es *ElasticSearchBackend) IndexMessage(msg *objects.Message) error {

	es_msg, err := msg.MarshalES()
	if err != nil {
		return err
	}

	resp, err := es.Client.Index().Index(msg.User_id.String()).Type(objects.MessageIndexType).Id(msg.Message_id.String()).
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

func (es *ElasticSearchBackend) SetMessageUnread(user_id, message_id string, status bool) (err error) {
	payload := struct {
		Is_unread bool `json:"is_unread"`
	}{status}

	update := es.Client.Update().Index(user_id).Type(objects.MessageIndexType).Id(message_id)
	_, err = update.Doc(payload).Refresh("true").Do(context.TODO())

	return
}

func (es *ElasticSearchBackend) FilterMessages(filter objects.IndexSearch) (messages []*objects.Message, totalFound int64, err error) {

	search := es.Client.Search().Index(filter.User_id.String()).Type(objects.MessageIndexType)
	search = filter.FilterQuery(search).Sort("date_insert", false)

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
		msg := new(objects.Message)
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
