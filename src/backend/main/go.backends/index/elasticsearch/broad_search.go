package index

import (
	"context"
	"encoding/json"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/satori/go.uuid"
	"gopkg.in/olivere/elastic.v5"
)

// Composes a full text ES query from IndexSearch object,
// making use of "common terms query" (see https://www.elastic.co/guide/en/elasticsearch/reference/5.4/query-dsl-common-terms-query.html).
// The func returns a compound response from ES to return 5 relevant docs filed by type if no doctype is provided,
// otherwise, all docs found within type are returned.
// See search API readme file into doc folder to see how the search func could be used by frontend.
func (es *ElasticSearchBackend) Search(search IndexSearch) (result *IndexResult, err error) {
	const (
		sub_agg_key = "top_score_hits"
		agg_key     = "by_type"
	)
	q := elastic.NewBoolQuery()
	for field, value := range search.Terms {
		q = q.Must(elastic.NewCommonTermsQuery(field, value).CutoffFrequency(0.01)) //words that have a document frequency greater than 1% will be treated as common terms.
	}

	// make aggregation to file docs by type:
	// get only the 5 most relevant doc for each type if search.DocType is empty
	// otherwise get docs according to limit & offset params.
	var s *elastic.SearchService
	switch search.DocType {
	case "":
		// no doctype provided. Trigger search on all document types within index and build an aggregation
		h := elastic.NewHighlight().Fields(elastic.NewHighlighterField("*").RequireFieldMatch(false))
		top_hits := elastic.NewTopHitsAggregation().Size(5).FetchSource(true).Highlight(h)
		by_type := elastic.NewTermsAggregation().Field("_type").SubAggregation(sub_agg_key, top_hits)
		//TODO/WIP
		/*iq := elastic.NewIndicesQuery(elastic.NewRangeQuery("importance_level").Gte(search.ILrange[0]).Lte(search.ILrange[1]), MessageIndexType)
		msg_hits := elastic.NewFilterAggregation().Filter(iq)
		*/
		s = es.Client.Search().Index(search.User_id.String()).Query(q).FetchSource(false).Aggregation(agg_key, by_type).Highlight(h)
	case MessageIndexType:
		// The search focuses on message document type, no aggregation needed, but importance level apply
		h := elastic.NewHighlight().Fields(elastic.NewHighlighterField("*").RequireFieldMatch(false))
		rq := elastic.NewRangeQuery("importance_level").Gte(search.ILrange[0]).Lte(search.ILrange[1])
		q = q.Filter(rq)
		s = es.Client.Search().Index(search.User_id.String()).Query(q).FetchSource(true).Highlight(h)
	case ContactIndexType:
		// The search focuses on message document type, no aggregation needed and importance level not taken into account
		h := elastic.NewHighlight().Fields(elastic.NewHighlighterField("*").RequireFieldMatch(false))
		s = es.Client.Search().Index(search.User_id.String()).Query(q).FetchSource(true).Highlight(h)
	}

	//prepare search
	// add type, from & size params only if type is not empty
	if search.DocType != "" {
		s = s.Type(search.DocType)
		if search.Offset > 0 {
			s = s.From(search.Offset)
		}
		if search.Limit > 0 {
			s = s.Size(search.Limit)
		}
	}

	// execute the search
	response, err := s.Do(context.TODO())
	if err != nil {
		return nil, err
	}

	// build IndexResult from ES response
	result = &IndexResult{
		Total:        response.TotalHits(),
		MessagesHits: MessageHits{0, []*IndexHit{}},
		ContactsHits: ContactHits{0, []*IndexHit{}},
	}

	if search.DocType != "" {
		// no aggregation, thus elastic returns a parsed json
		switch search.DocType {
		case MessageIndexType:
			result.MessagesHits.Total = response.TotalHits()
			for _, hit := range response.Hits.Hits {
				msg := new(Message)
				if err := json.Unmarshal(*hit.Source, msg); err != nil {
					log.Info(err)
					continue
				}
				msg_id, _ := uuid.FromString(hit.Id)
				msg.Message_id.UnmarshalBinary(msg_id.Bytes())

				msg_hit := new(IndexHit)
				msg_hit.Id = msg.Message_id
				msg_hit.Score = *hit.Score
				msg_hit.Highlights = hit.Highlight
				msg_hit.Document = msg
				(*result).MessagesHits.Messages = append((*result).MessagesHits.Messages, msg_hit)
			}
		case ContactIndexType:
			result.ContactsHits.Total = response.TotalHits()
			for _, hit := range response.Hits.Hits {
				contact := new(Contact)
				if err := json.Unmarshal(*hit.Source, contact); err != nil {
					log.Info(err)
					continue
				}
				contact_id, _ := uuid.FromString(hit.Id)
				contact.ContactId.UnmarshalBinary(contact_id.Bytes())

				contact_hit := new(IndexHit)
				contact_hit.Id = contact.ContactId
				contact_hit.Score = *hit.Score
				contact_hit.Highlights = hit.Highlight
				contact_hit.Document = contact
				(*result).ContactsHits.Contacts = append((*result).ContactsHits.Contacts, contact_hit)
			}
		}

	} else {
		// elastic returns buckets aggregation as a raw []byte, need to unmarshal
		by_types, _ := response.Aggregations[agg_key] // by_types is a *json.RawMessage
		var agg map[string]interface{}
		err = json.Unmarshal(*by_types, &agg)
		if err != nil {
			return nil, err
		}
		buckets := agg["buckets"].([]interface{})
		for _, b := range buckets {
			bucket := b.(map[string]interface{})
			total, _ := bucket["doc_count"].(float64)
			switch bucket["key"].(string) {
			case MessageIndexType:
				(*result).MessagesHits.Total = int64(total)
			case ContactIndexType:
				(*result).ContactsHits.Total = int64(total)
			}

			//go deeper within map to get documents and unmarshal them to our objects
			top_score_hits, _ := bucket[sub_agg_key].(map[string]interface{})
			hits, _ := top_score_hits["hits"].(map[string]interface{})
			hits_hits, _ := hits["hits"].([]interface{})

			for _, hh := range hits_hits {
				hit := hh.(map[string]interface{})
				h := new(IndexHit)
				id, _ := hit["_id"].(string)
				uuid, _ := uuid.FromString(id)
				h.Id.UnmarshalBinary(uuid.Bytes())
				h.Score, _ = hit["_score"].(float64)
				highlights, _ := hit["highlight"].(map[string]interface{})
				h.Highlights = map[string][]string{}
				for key, value := range highlights {
					for _, highlight := range value.([]interface{}) {
						h.Highlights[key] = append(h.Highlights[key], highlight.(string))
					}
				}
				switch bucket["key"].(string) {
				case MessageIndexType:
					msg_map, _ := hit["_source"].(map[string]interface{})
					msg := new(Message)
					if err := msg.UnmarshalMap(msg_map); err == nil {
						msg.User_id = search.User_id
						msg.Message_id = h.Id
						h.Document = msg
						(*result).MessagesHits.Messages = append(result.MessagesHits.Messages, h)
					}
				case ContactIndexType:
					contact_map, _ := hit["_source"].(map[string]interface{})
					contact := new(Contact)
					if err := contact.UnmarshalMap(contact_map); err == nil {
						contact.UserId = search.User_id
						contact.ContactId = h.Id
						h.Document = contact
						(*result).ContactsHits.Contacts = append(result.ContactsHits.Contacts, h)
					}
				}
			}
		}
	}

	return
}
