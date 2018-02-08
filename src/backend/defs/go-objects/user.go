// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// only struct and interfaces definitions in this pkg

package objects

import (
	"encoding/json"
	"github.com/gocql/gocql"
	"github.com/satori/go.uuid"
	"time"
)

// Struct to operate on user objects
type UserInfo struct {
    User_id           string
    Shard_id          string
}

type User struct {
	ContactId        UUID              `cql:"contact_id"               json:"contact_id"`
	DateInsert       time.Time         `cql:"date_insert"              json:"date_insert"                              formatter:"RFC3339Milli"`
	FamilyName       string            `cql:"family_name"              json:"family_name"`
	GivenName        string            `cql:"given_name"               json:"given_name"`
	LocalIdentities  []string          `cql:"local_identities"         json:"local_identities"`
	MainUserId       UUID              `cql:"main_user_id"             json:"main_user_id"`
	Name             string            `cql:"name"                     json:"name"`
	Params           map[string]string `cql:"params"                   json:"params"`
	Password         []byte            `cql:"password"                 json:"password"`
	PrivacyIndex     *PrivacyIndex     `cql:"pi"                       json:"pi"`
	*PrivacyFeatures `cql:"privacy_features"         json:"privacy_features"`
	RecoveryEmail    string `cql:"recovery_email"            json:"recovery_email"`
	UserId           UUID   `cql:"user_id"                  json:"user_id"              elastic:"omit"      formatter:"rfc4122"`
	ShardId 		 string   `cql:"shard_id"          json:"shard_id"`
}

// payload for triggering a password reset procedure for an end-user.
type PasswordResetRequest struct {
	RecoveryMail string `json:"recovery_email"`
	Username     string `json:"username"`
}

// data stored into cache for authenticated user
type Auth_cache struct {
	Access_token  string    `json:"access_token"`
	Expires_in    int       `json:"expires_in"`
	Expires_at    time.Time `json:"expires_at"`
	Refresh_token string    `json:"refresh_token"`
	Shard_id      string    `json:"shard_id"`
}

// data stored into cache as long as a reset password request is pending for an user
type Pass_reset_session struct {
	Reset_token string    `json:"reset_token"`
	Expires_in  int       `json:"expires_in"`
	Expires_at  time.Time `json:"expires_at"`
	User_id     string    `json:"user_id"`
}

// unmarshal a map[string]interface{} that must owns all Contact's fields
// typical usage is for unmarshaling response from Cassandra backend
func (user *User) UnmarshalCQLMap(input map[string]interface{}) {
	contactId, _ := input["contact_id"].(gocql.UUID)
	user.ContactId.UnmarshalBinary(contactId.Bytes())
	user.DateInsert, _ = input["date_insert"].(time.Time)
	user.FamilyName, _ = input["family_name"].(string)
	user.GivenName, _ = input["given_name"].(string)
	user.LocalIdentities, _ = input["local_identities"].([]string)
	mainUserId, _ := input["main_user_id"].(gocql.UUID)
	user.MainUserId.UnmarshalBinary(mainUserId.Bytes())
	user.Name, _ = input["name"].(string)
	password, _ := input["password"].(string)
	user.Password = []byte(password)
	if input["pi"] != nil {
		i_pi, _ := input["pi"].(map[string]interface{})
		pi := PrivacyIndex{}
		pi.Comportment, _ = i_pi["comportment"].(int)
		pi.Context, _ = i_pi["context"].(int)
		pi.DateUpdate, _ = i_pi["date_update"].(time.Time)
		pi.Technic, _ = i_pi["technic"].(int)
		pi.Version, _ = i_pi["version"].(int)
		user.PrivacyIndex = &pi
	} else {
		user.PrivacyIndex = nil
	}
	if input["privacy_features"] != nil {
		i_pf, _ := input["privacy_features"].(map[string]string)
		pf := PrivacyFeatures{}
		for k, v := range i_pf {
			pf[k] = v
		}
		user.PrivacyFeatures = &pf

	} else {
		user.PrivacyFeatures = nil
	}
	user.RecoveryEmail, _ = input["recovery_email"].(string)
	userid, _ := input["user_id"].(gocql.UUID)
	user.UserId.UnmarshalBinary(userid.Bytes())
}

func (user *User) UnmarshalJSON(b []byte) error {
	input := map[string]interface{}{}
	if err := json.Unmarshal(b, &input); err != nil {
		return err
	}

	return user.UnmarshalMap(input)
}

func (user *User) UnmarshalMap(input map[string]interface{}) error {

	if contact_id, ok := input["contact_id"].(string); ok {
		if id, err := uuid.FromString(contact_id); err == nil {
			user.ContactId.UnmarshalBinary(id.Bytes())
		}
	}

	if date, ok := input["date_insert"]; ok {
		user.DateInsert, _ = time.Parse(time.RFC3339Nano, date.(string))
	}

	user.FamilyName, _ = input["family_name"].(string)
	user.GivenName, _ = input["given_name"].(string)
	user.LocalIdentities, _ = input["local_identities"].([]string)

	if main_user_id, ok := input["main_user_id"].(string); ok {
		if id, err := uuid.FromString(main_user_id); err == nil {
			user.MainUserId.UnmarshalBinary(id.Bytes())
		}
	}

	user.Name, _ = input["name"].(string)
	user.Params, _ = input["params"].(map[string]string)
	password, _ := input["password"].(string)
	user.Password = []byte(password)

	if pi, ok := input["pi"]; ok && pi != nil {
		PI := new(PrivacyIndex)
		if err := PI.UnmarshalMap(pi.(map[string]interface{})); err == nil {
			user.PrivacyIndex = PI
		}
	}

	if pf, ok := input["privacy_features"]; ok && pf != nil {
		PF := &PrivacyFeatures{}
		PF.UnmarshalMap(pf.(map[string]interface{}))
		user.PrivacyFeatures = PF
	}

	user.RecoveryEmail, _ = input["recovery_email"].(string)

	if user_id, ok := input["user_id"].(string); ok {
		if id, err := uuid.FromString(user_id); err == nil {
			user.UserId.UnmarshalBinary(id.Bytes())
		}
	}

	return nil
}

// bespoke implementation of the json.Marshaller interface
// outputs a JSON representation of an object
// this marshaler takes account of custom tags for given 'context'
func (user *User) JSONMarshaller(context string, body_type ...string) ([]byte, error) {
	//TODO
	return []byte{}, nil
}

func (user *User) MarshalJSON() ([]byte, error) {
	//TODO
	return []byte{}, nil
}

// return a JSON representation of Message suitable for frontend client
func (user *User) MarshalFrontEnd(body_type string) ([]byte, error) {
	//TODO
	return []byte{}, nil
}

// implementation of the CaliopenObject interface
func (user *User) JsonTags() (tags map[string]string) {
	return jsonTags(user)
}

func (user *User) NewEmpty() interface{} {
	u := new(User)
	u.Params = make(map[string]string)
	return u
}

//bespoke unmarshaller to workaround the expires_at field that is not RFC in cache (tz is missing, thanks python)
func (ac *Auth_cache) UnmarshalJSON(b []byte) error {
	var temp struct {
		Access_token  string `json:"access_token"`
		Expires_in    int    `json:"expires_in"`
		Expires_at    string `json:"expires_at"`
		Refresh_token string `json:"refresh_token"`
		Shard_id      string `json:"shard_id"`
	}
	if err := json.Unmarshal(b, &temp); err != nil {
		return err
	}
	ac.Access_token = temp.Access_token
	ac.Expires_in = temp.Expires_in
	expire, err := time.Parse(time.RFC3339Nano, temp.Expires_at+"Z")
	if err != nil {
		return err
	}
	ac.Expires_at = expire
	ac.Refresh_token = temp.Refresh_token
	ac.Shard_id = temp.Shard_id
	return nil
}
