// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package index

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	objects "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/satori/go.uuid"
	"gopkg.in/oleiade/reflections.v1"
	"gopkg.in/olivere/elastic.v5"
	"sort"
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
		Doc(jsonFields).
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
	search = filter.FilterQuery(search, true).Sort("date_sort", false)

	if filter.Offset > 0 {
		search = search.From(filter.Offset)
	}
	if filter.Limit > 0 {
		search = search.Size(filter.Limit)
	}

	return executeMessagesQuery(search)

}

// GetMessagesRange build a `search_after` query to retrieve messages before and/or after a specific message within a discussion
func (es *ElasticSearchBackend) GetMessagesRange(filter objects.IndexSearch) (messages []*objects.Message, totalFound int64, err error) {

	messages = []*objects.Message{}
	var msg *objects.Message

	// remove range[] and msg_id from terms
	msgId := filter.Terms["msg_id"][0]
	delete(filter.Terms, "msg_id")
	var wantBefore bool
	var wantAfter bool
	for _, param := range filter.Terms["range[]"] {
		if param == "before" {
			wantBefore = true
		} else if param == "after" {
			wantAfter = true
		}
	}
	delete(filter.Terms, "range[]")

	// retrieve message with msg_id because search_after will not return it
	// XXX chamal: need Userinfo filtering
	esMsg, esErr := es.Client.Get().Index(filter.Shard_id).Type(objects.MessageIndexType).Id(msgId).Do(context.TODO())
	if esErr != nil {
		return nil, 0, esErr
	}
	if !esMsg.Found {
		return nil, 0, errors.New("not found")
	}
	msg = new(objects.Message).NewEmpty().(*objects.Message)
	if err := json.Unmarshal(*esMsg.Source, msg); err != nil {
		return nil, 0, err
	}
	if e := msg.Message_id.UnmarshalBinary(uuid.FromStringOrNil(msgId).Bytes()); e != nil {
		log.WithError(e).Warnf("failed to unmarshal %s", msgId)
	}
	messages = append(messages, msg)

	// add discussion_id to filter.Terms
	filter.Terms["discussion_id"] = []string{msg.Discussion_id.String()}

	// prepare search

	// make search_after query for `after` param
	if wantAfter {
		searchAfter := es.Client.Search().Index(filter.Shard_id).Type(objects.MessageIndexType)
		if filter.Offset > 0 {
			searchAfter = searchAfter.From(filter.Offset)
		}
		if filter.Limit > 0 {
			searchAfter = searchAfter.Size(filter.Limit)
		}
		searchAfter = filter.FilterQuery(searchAfter, true).Sort("date_sort", false).Sort("_uid", false)
		searchAfter = searchAfter.SearchAfter(msg.Date_sort.UnixNano()/10e5, objects.MessageIndexType+"#"+msgId)
		after, afterTotal, afterErr := executeMessagesQuery(searchAfter)
		if afterErr != nil {
			return nil, 0, afterErr
		}
		messages = append(messages, after...)
		totalFound = afterTotal
	}

	// make search_after query for `before` param
	if wantBefore {
		searchBefore := es.Client.Search().Index(filter.Shard_id).Type(objects.MessageIndexType)
		if filter.Offset > 0 {
			searchBefore = searchBefore.From(filter.Offset)
		}
		if filter.Limit > 0 {
			searchBefore = searchBefore.Size(filter.Limit)
		}
		searchBefore = filter.FilterQuery(searchBefore, true).Sort("date_sort", true).Sort("_uid", true)
		searchBefore = searchBefore.SearchAfter(msg.Date_sort.UnixNano()/10e5, objects.MessageIndexType+"#"+msgId)

		before, beforeTotal, beforeErr := executeMessagesQuery(searchBefore)
		if beforeErr != nil {
			return nil, 0, beforeErr
		}
		messages = append(messages, before...)
		totalFound = beforeTotal
	}
	sort.Sort(objects.ByDateSortAsc(messages))
	return messages, totalFound, nil
}

// return false if message not found or error
func (es *ElasticSearchBackend) SeekMessageByExternalRef(userID, externalMessageID string) (bool, error) {
	q := elastic.NewBoolQuery()
	// Strictly filter on user_id and external ref.
	q = q.Must(
		elastic.NewTermQuery("user_id", userID),
		elastic.NewNestedQuery("external_references", elastic.NewTermQuery("external_references.message_id", externalMessageID)),
	)

	result, err := es.Client.Search().Type(objects.MessageIndexType).Query(q).Do(context.TODO())
	if err != nil {
		return false, err
	} else if result.TotalHits() > 0 {
		return true, nil
	}
	return false, nil
}

func executeMessagesQuery(search *elastic.SearchService) (messages []*objects.Message, totalFound int64, err error) {
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
