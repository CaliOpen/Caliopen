package objects

import "gopkg.in/olivere/elastic.v5"

// params to pass to API to trigger an elasticsearch search
type IndexSearch struct {
	Limit   int
	Offset  int
	Terms   map[string][]string
	User_id UUID
}

type IndexResult struct {
	Total int64
	Hits  []*IndexHit
}

type IndexHit struct {
	Type       string              `json:"type"`
	Id         UUID                `json:"id"`
	Score      float64             `json:"score"`
	Highlights map[string][]string `json:"highlights"`
	Document   interface{}         `json:"document"`
}

func (is *IndexSearch) FilterQuery(service *elastic.SearchService) *elastic.SearchService {

	if len(is.Terms) == 0 {
		return service
	}

	q := elastic.NewBoolQuery()
	for name, values := range is.Terms {
		for _, value := range values {
			q = q.Filter(elastic.NewTermQuery(name, value))
		}
	}

	service = service.Query(q)

	return service
}

func (is *IndexSearch) MatchQuery(service *elastic.SearchService) *elastic.SearchService {

	if len(is.Terms) == 0 {
		return service
	}
	//TODO

	return service
}
