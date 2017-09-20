package REST

import (
	"encoding/json"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

// API to execute broad-based searches within index
// Searches are executed in all indexes of user
func (rest *RESTfacility) Search(search IndexSearch) (response []byte, err error) {
	result, err := rest.index.Search(search)
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(result)
}
