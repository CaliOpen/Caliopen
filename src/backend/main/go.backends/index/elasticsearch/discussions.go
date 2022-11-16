// Copyleft (ɔ) 2019 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package index

import (
	"context"
	"encoding/json"

	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/helpers"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/messages"
	uuid "github.com/satori/go.uuid"
	"gopkg.in/olivere/elastic.v5"
)

// GetDiscussionList returns all the discussion_id found in index for an user
// aggregated by discussion_id, with metadata.
func (es *ElasticSearchBackend) GetDiscussionsList(filter IndexSearch, withIL bool) (discussions []Discussion, err error) {
	discussions = []Discussion{}

	search := es.Client.Search().Index(filter.Shard_id).Type(MessageIndexType)
	search = filter.FilterQuery(search, withIL)
	msgSource := elastic.NewFetchSourceContext(true)
	msgSource.Include("date_sort", "subject", "participants", "body_plain", "body_html", "importance_level")
	search.Aggregation("by_uris", elastic.NewTermsAggregation().Field("discussion_id.keyword").Size(10e3). // need to fetch all buckets to have an accurate buckets count
														SubAggregation("sub_bucket", elastic.NewTopHitsAggregation().Sort("date_sort", false).Size(1).FetchSourceContext(msgSource)).
														SubAggregation("unread_count", elastic.NewFilterAggregation().Filter(elastic.NewTermQuery("is_unread", true))).
														SubAggregation("importance_level", elastic.NewTermsAggregation().Field("importance_level").Size(100).OrderByTermDesc()))
	// TODO : attachment count aggr

	var result *elastic.SearchResult
	result, err = search.Do(context.TODO())

	if err != nil {
		return nil, err
	}
	agg := result.Aggregations["by_uris"]
	var byUris Aggregation
	json.Unmarshal([]byte(*agg), &byUris)

	if len(byUris.Buckets) == 0 {
		return
	}

	/*
		byUris' Bucket.SubBucket :
			map[hits:
				map[hits:
				 [map[
					_id:xxxx
					_index:xxxx
					_score:<nil>
					_source:map[date_sort:xx participants:[xxxx] subject:xxx]
	*/

	// build discussions' array from raw bytes result
	for _, hit := range byUris.Buckets {
		msg := &Message{}
		var subBucket map[string]interface{}
		json.Unmarshal(hit.SubBucket, &subBucket)
		var subHit = subBucket["hits"].(map[string]interface{})["hits"].([]interface{})[0].(map[string]interface{})

		msg.UnmarshalMap(subHit["_source"].(map[string]interface{}))
		// flatten importance levels distribution to an array of float64 for later computation
		var importanceAgg Aggregation
		json.Unmarshal(hit.ImportanceLevel, &importanceAgg)
		messagesIL := []float64{}
		for _, bucket := range importanceAgg.Buckets {
			for i := 0; i < bucket.DocCount; i++ {
				messagesIL = append(messagesIL, float64(bucket.Key.(float64)))
			}
		}

		discussions = append(discussions, Discussion{
			DateUpdate:         msg.Date_sort,
			DiscussionId:       hit.Key.(string),
			Excerpt:            messages.ExcerptMessage(*msg, 200, true, true),
			ImportanceLevel:    int32(helpers.ComputeDiscussionIL(messagesIL)),
			LastMessageDate:    msg.Date_sort,
			LastMessageId:      UUID(uuid.FromStringOrNil(subHit["_id"].(string))),
			LastMessageSubject: msg.Subject,
			Participants:       msg.Participants,
			Subject:            msg.Subject,
			TotalCount:         int32(hit.DocCount),
			UnreadCount:        int32(hit.UnreadCount.DocCount),
			UserId:             filter.User_id,
		})
	}

	return discussions, err
}
