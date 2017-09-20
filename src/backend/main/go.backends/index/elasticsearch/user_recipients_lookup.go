// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package index

import (
	"context"
	"encoding/json"
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"gopkg.in/olivere/elastic.v5"
)

type (
	returnedContact struct {
		Fname string `json:"family_name"`
		Gname string `json:"given_name"`
		Title string `json:"title"`
	}

	returnedParticipant struct {
		Address     string   `json:"address"`
		Contact_ids []string `json:"contact_ids"`
		Label       string   `json:"label"`
		Protocol    string   `json:"protocol"`
		Type        string   `json:"type"`
	}
	returnedMessage struct {
		Date string `json:"date"`
		Type string `json:"type"`
	}
)

// build ES queries and responses for finding relevant recipients when an user compose a message
func (es *ElasticSearchBackend) RecipientsSuggest(user_id, query_string string) (suggests []RecipientSuggestion, err error) {
	q_string := `*` + query_string + `*`

	// build nested queries for participants lookup
	participants_label_q := elastic.NewWildcardQuery("participants.label", q_string)
	participants_address_q := elastic.NewWildcardQuery("participants.address", q_string)
	participants_fields_q := elastic.NewBoolQuery().Should(participants_address_q, participants_label_q)
	participants_q := elastic.NewNestedQuery("participants", participants_fields_q)
	participants_q.InnerHit(elastic.NewInnerHit().Size(1))

	// build queries for contact lookup
	contact_given_name_q := elastic.NewWildcardQuery("given_name", q_string).Boost(2)
	contact_family_name_q := elastic.NewWildcardQuery("family_name", q_string).Boost(2)
	contact_name_q := elastic.NewBoolQuery().Should(contact_given_name_q, contact_family_name_q)

	email_label_q := elastic.NewWildcardQuery("emails.label", q_string).Boost(2)
	email_address_q := elastic.NewWildcardQuery("emails.address", q_string).Boost(2)
	nested_emails_q := elastic.NewBoolQuery().Should(email_label_q, email_address_q)
	emails_q := elastic.NewNestedQuery("emails", nested_emails_q)
	emails_q.InnerHit(elastic.NewInnerHit())

	// doc source pruning
	fsc := elastic.NewFetchSourceContext(true)
	fsc.Include("title")

	// make aggregations
	max_date_agg := elastic.NewMaxAggregation().Field("date")

	// run the query
	main_query := elastic.NewBoolQuery().Should(participants_q, contact_name_q, emails_q)
	search := es.Client.Search().
		Index(user_id).
		FetchSourceContext(fsc).
		Aggregation("last_message", max_date_agg)

	result, err := search.Query(main_query).Do(context.TODO())

	participants_suggests := make(map[string]RecipientSuggestion)
	for _, hit := range result.Hits.Hits {
		switch hit.Type {
		case MessageIndexType:
			suggest, e := extractParticipantInfos(hit)
			if e != nil {
				log.WithError(e).Warnf("failed to extract message participants")
			}
			//deduplicate
			if _, ok := participants_suggests[suggest.Address]; !ok {
				participants_suggests[suggest.Address] = suggest
				suggests = append(suggests, suggest)
			}
		case ContactIndexType:
			suggest, e := extractContactInfos(hit)
			if e != nil {
				log.WithError(e).Warnf("failed to extract contact info")
			}
			suggests = append(suggests, suggest)
		default:
			suggest := RecipientSuggestion{
				Source: "<" + hit.Type + ">",
			}
			suggests = append(suggests, suggest)
		}
	}

	return
}

func extractContactInfos(contact_hit *elastic.SearchHit) (suggest RecipientSuggestion, err error) {
	var contact returnedContact
	if e := json.Unmarshal(*contact_hit.Source, &contact); e != nil {
		err = errors.New("[ES RecipientSuggest] failed unmarshaling hit's source : " + e.Error())
		return
	}
	suggest.Source = "contact"
	suggest.Label = contact.Title
	suggest.Contact_Id = contact_hit.Id
	return
}

func extractParticipantInfos(message_hit *elastic.SearchHit) (suggest RecipientSuggestion, err error) {
	inner_hit := message_hit.InnerHits["participants"].Hits.Hits[0]
	var participant returnedParticipant
	if e := json.Unmarshal(*inner_hit.Source, &participant); e != nil {
		err = errors.New("[ES RecipientSuggest] failed unmarshaling hit's source : " + e.Error())
		return
	}
	suggest.Source = "participant"
	suggest.Label = participant.Label
	suggest.Address = participant.Address
	suggest.Protocol = participant.Protocol
	return
}
