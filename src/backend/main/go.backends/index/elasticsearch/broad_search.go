package index

import (
	"context"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/satori/go.uuid"
	"gopkg.in/olivere/elastic.v5"

	"encoding/json"
)

// composes a full text ES query from IndexSearch object
// making use of "common terms query" (https://www.elastic.co/guide/en/elasticsearch/reference/5.4/query-dsl-common-terms-query.html)
// returns raw ES response, casted into our IndexResult object.
func (es *ElasticSearchBackend) Search(search IndexSearch) (result *IndexResult, err error) {
	q := elastic.NewBoolQuery()
	for field, value := range search.Terms {
		q = q.Must(elastic.NewCommonTermsQuery(field, value).CutoffFrequency(0.01)) //words that have a document frequency greater than 1% will be treated as common terms.
	}
	h := elastic.NewHighlight().Fields(elastic.NewHighlighterField("*").RequireFieldMatch(false))
	s := es.Client.Search().Index(search.User_id.String()).Query(q).Highlight(h)

	if search.Offset > 0 {
		s = s.From(search.Offset)
	}
	if search.Limit > 0 {
		s = s.Size(search.Limit)
	}

	es_response, err := s.Do(context.TODO())

	if err != nil {
		return nil, err
	}

	result = &IndexResult{
		Total: es_response.TotalHits(),
		Hits:  []*IndexHit{},
	}

	for _, hit := range es_response.Hits.Hits {
		id, _ := uuid.FromString(hit.Id)
		h := &IndexHit{
			Score:      *hit.Score,
			Highlights: hit.Highlight,
		}
		h.Id.UnmarshalBinary(id.Bytes())
		switch hit.Type {
		case MessageIndexType:
			h.Type = MessageType
			msg := new(Message)
			if err := json.Unmarshal(*hit.Source, msg); err == nil {
				msg.Message_id = h.Id
				msg.User_id = search.User_id
				h.Document = msg
				result.Hits = append(result.Hits, h)
			}
		case ContactIndexType:
			h.Type = ContactType
			cntct := new(Contact)
			if err := json.Unmarshal(*hit.Source, cntct); err == nil {
				cntct.ContactId = h.Id
				cntct.UserId = search.User_id
				h.Document = cntct
				result.Hits = append(result.Hits, h)
			}
		default:
			continue
		}
	}

	return
}
