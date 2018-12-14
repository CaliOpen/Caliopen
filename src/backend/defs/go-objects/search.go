package objects

import (
	"bytes"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"gopkg.in/oleiade/reflections.v1"
	"gopkg.in/olivere/elastic.v5"
)

// params to pass to API to trigger an elasticsearch filtering search
type IndexSearch struct {
	Limit    int                 `json:"limit"`
	Offset   int                 `json:"offset"`
	Terms    map[string][]string `json:"terms"`
	Shard_id string              `json:"shard_id"`
	User_id  UUID                `json:"user_id"`
	DocType  string              `json:"doc_type"`
	ILrange  [2]int8             `json:"il_range"`
}

type IndexResult struct {
	Total        int64       `json:"total"`
	MessagesHits MessageHits `json:"messages_hits"`
	ContactsHits ContactHits `json:"contact_hits"`
}

type MessageHits struct {
	Total    int64       `json:"total"`
	Messages []*IndexHit `json:"messages"`
}

type ContactHits struct {
	Total    int64       `json:"total"`
	Contacts []*IndexHit `json:"contacts"`
}

type IndexHit struct {
	Id         UUID                `json:"id"`
	Score      float64             `json:"score"`
	Highlights map[string][]string `json:"highlights"`
	Document   interface{}         `json:"document"`
}

func (is *IndexSearch) FilterQuery(service *elastic.SearchService, withIL bool) *elastic.SearchService {
	q := elastic.NewBoolQuery()
	// Strictly filter on user_id
	q = q.Filter(elastic.NewTermQuery("user_id", is.User_id))
	for name, values := range is.Terms {
		for _, value := range values {
			q = q.Filter(elastic.NewTermQuery(name, value))
		}
	}
	if withIL {
		rq := elastic.NewRangeQuery("importance_level").Gte(is.ILrange[0]).Lte(is.ILrange[1])
		q = q.Filter(rq)
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

func (ir *IndexResult) MarshalFrontEnd() ([]byte, error) {
	return ir.JSONMarshaller("frontend")
}

// bespoke implementation of the json.Marshaller interface
// it makes use of our custom JSONMarshaller when available
func (ir *IndexResult) JSONMarshaller(context string) ([]byte, error) {
	var jsonBuf bytes.Buffer
	enc := json.NewEncoder(&jsonBuf)

	fields, err := reflections.Fields(*ir)
	if err != nil {
		return jsonBuf.Bytes(), err
	}
	jsonBuf.WriteByte('{')
	first := true
fieldsLoop:
	for _, field := range fields {
		j_field, err := reflections.GetFieldTag(*ir, field, "json")
		if err != nil {
			log.WithError(err).Warnf("reflection for field %s failed", field)
		} else {
			if j_field != "" && j_field != "-" {
				if first {
					first = false
				} else {
					jsonBuf.WriteByte(',')
				}
				jsonBuf.WriteString("\"" + j_field + "\":")
				// marshal messages hits apart to use custom JSONMarshaller for Messages objects
				if field == "MessagesHits" {
					sub_fields, err := reflections.Fields((*ir).MessagesHits)
					if err == nil {
						jsonBuf.WriteByte('{')
						first := true
						for _, sub_field := range sub_fields {
							j_field, err := reflections.GetFieldTag((*ir).MessagesHits, sub_field, "json")
							if err != nil {
								log.WithError(err).Warnf("reflection for field %s failed", sub_field)
								continue fieldsLoop
							} else {
								if j_field != "" && j_field != "-" {
									if first {
										first = false
									} else {
										jsonBuf.WriteByte(',')
									}
									jsonBuf.WriteString("\"" + j_field + "\":")
									if sub_field == "Messages" {
										// iterate over messages to use custom Message's JSONMarshaller
										jsonBuf.WriteByte('[')
										first := true
										for _, msg_hit := range (*ir).MessagesHits.Messages {
											if first {
												first = false
											} else {
												jsonBuf.WriteByte(',')
											}
											hit_fields, err := reflections.Fields(*msg_hit)
											if err == nil {
												jsonBuf.WriteByte('{')
												first := true
												for _, hit_field := range hit_fields {
													j_field, err := reflections.GetFieldTag(*msg_hit, hit_field, "json")
													if err != nil {
														log.WithError(err).Warnf("reflection for field %s failed", hit_field)
														continue fieldsLoop
													} else {
														if j_field != "" && j_field != "-" {
															if first {
																first = false
															} else {
																jsonBuf.WriteByte(',')
															}
															jsonBuf.WriteString("\"" + j_field + "\":")
															if hit_field == "Document" {
																out, err := (*msg_hit).Document.(*Message).JSONMarshaller(context)
																if err == nil {
																	jsonBuf.Write(out)
																}
															} else {
																field_value, err := reflections.GetField(*msg_hit, hit_field)
																if err == nil {
																	enc.Encode(field_value)
																} else {
																	jsonBuf.Write([]byte{'"', '"'})
																}
															}
														}
													}
												}
												jsonBuf.WriteByte('}')
											} else {
												continue fieldsLoop
											}
										}
										jsonBuf.WriteByte(']')
									} else {
										field_value, err := reflections.GetField((*ir).MessagesHits, sub_field)
										if err == nil {
											enc.Encode(field_value)
										} else {
											jsonBuf.Write([]byte{'"', '"'})
										}
									}
								}
							}
						}
						jsonBuf.WriteByte('}')
					} else {
						continue fieldsLoop
					}
				} else {
					field_value, err := reflections.GetField(*ir, field)
					if err == nil {
						enc.Encode(field_value)
					} else {
						jsonBuf.Write([]byte{'"', '"'})
					}
				}
			} else {
				log.Warnf("Invalid field %s value: %s", field, j_field)
			}
		}
	}
	jsonBuf.WriteByte('}')
	return jsonBuf.Bytes(), nil

}
