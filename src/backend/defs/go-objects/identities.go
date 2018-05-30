// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"bytes"
	"github.com/gocql/gocql"
	"github.com/satori/go.uuid"
	"time"
)

type (
	//object stored in db
	LocalIdentity struct {
		Display_name string `cql:"display_name"            json:"display_name"`
		Identifier   string `cql:"identifier"              json:"identifier"`
		Status       string `cql:"status"                  json:"status"`
		Type         string `cql:"type"                    json:"type"`
		User_id      UUID   `cql:"user_id"                 json:"user_id"           formatter:"rfc4122"`
	}

	// embedded in a contact
	SocialIdentity struct {
		Infos    map[string]string `cql:"infos"     json:"infos,omitempty"        patch:"user"`
		Name     string            `cql:"name"      json:"name,omitempty"         patch:"user"`
		SocialId UUID              `cql:"social_id" json:"social_id,omitempty"    patch:"system"`
		Type     string            `cql:"type"      json:"type,omitempty"         patch:"user"`
	}

	//reference embedded in a message
	Identity struct {
		Identifier string `cql:"identifier"     json:"identifier"`
		Type       string `cql:"type"           json:"type"`
	}

	// Mean of communication for a contact, with on-demand calculated PI.
	ContactIdentity struct {
		Identifier   string       `json:"identifier"` // the 'I' like in URI, ie : the email address for email ; the user's real name for IRC
		Label        string       `json:"label"`      // the 'display-name' field in email address if available ; the 'nickname' for IRC
		PrivacyIndex PrivacyIndex `json:"privacy_index"`
		Protocol     string       `json:"protocol"` // email, irc, sms, etc.
	}

	//struct returned to user by suggest engine when performing a string query search
	RecipientSuggestion struct {
		Address    string `json:"address,omitempty"`    // could be empty if suggestion is a contact (or should we automatically put preferred identity's address ?)
		Contact_Id string `json:"contact_id,omitempty"` // contact's ID if any
		Label      string `json:"label,omitempty"`      // name of contact or <display-name> in case of an address returned from participants lookup, if any
		Protocol   string `json:"protocol,omitempty"`   // email, IRC…
		Source     string `json:"source,omitempty"`     // "participant" or "contact", ie from where this suggestion came from
	}

	//struct to store external user accounts
	RemoteIdentity struct {
		DisplayName string            `cql:"display_name"       json:"display_name"`
		Identifier  string            `cql:"identifier"         json:"identifier"`
		Infos       map[string]string `cql:"infos"              json:"infos"`
		LastCheck   time.Time         `cql:"last_check"         json:"last_check"           formatter:"RFC3339Milli"`
		Status      string            `cql:"status"             json:"status"` // for example : active, inactive, deleted
		Type        string            `cql:"type"               json:"type"`   // for example : imap, twitter…
		UserId      UUID              `cql:"user_id"            json:"user_id"              frontend:"omit"`
	}
)

func (si *SocialIdentity) UnmarshalMap(input map[string]interface{}) error {
	si.Infos, _ = input["infos"].(map[string]string)
	si.Name, _ = input["name"].(string)
	if soc_id, ok := input["social_id"].(string); ok {
		if id, err := uuid.FromString(soc_id); err == nil {
			si.SocialId.UnmarshalBinary(id.Bytes())
		}
	}
	si.Type, _ = input["type"].(string)
	return nil //TODO: errors handling
}

func (li *LocalIdentity) UnmarshalMap(input map[string]interface{}) error {
	li.Display_name, _ = input["display_name"].(string)
	li.Identifier, _ = input["identifier"].(string)
	li.Status, _ = input["status"].(string)
	li.Type, _ = input["type"].(string)
	if user_id, ok := input["user_id"].(string); ok {
		if id, err := uuid.FromString(user_id); err == nil {
			li.User_id.UnmarshalBinary(id.Bytes())
		}
	}
	return nil //TODO: errors handling
}

func (i *Identity) UnmarshalMap(input map[string]interface{}) error {
	i.Identifier, _ = input["identifier"].(string)
	i.Type, _ = input["type"].(string)
	return nil //TODO: errors handling
}

// MarshallNew must be a variadic func to implement NewMarshaller interface,
// but SocialIdentity does not need params to marshal a well-formed SocialIdentity: ...interface{} is ignored
func (si *SocialIdentity) MarshallNew(...interface{}) {
	if len(si.SocialId) == 0 || (bytes.Equal(si.SocialId.Bytes(), EmptyUUID.Bytes())) {
		si.SocialId.UnmarshalBinary(uuid.NewV4().Bytes())
	}
}

func (i *Identity) MarshallNew(...interface{}) {
	//nothing to enforce
}

/** remote identity **/
func (ri *RemoteIdentity) NewEmpty() interface{} {
	nri := new(RemoteIdentity)
	nri.Infos = map[string]string{}
	return nri
}

// ensure mandatory properties are set, also default values.
func (ri *RemoteIdentity) MarshallNew(args ...interface{}) {
	if len(ri.UserId) == 0 || (bytes.Equal(ri.UserId.Bytes(), EmptyUUID.Bytes())) {
		if len(args) == 1 {
			switch args[0].(type) {
			case UUID:
				ri.UserId = args[0].(UUID)
			}
		}
	}
}

// SetDefaults fills `Infos` map with default keys and values according to the type of the remote identity
func (ri *RemoteIdentity) SetDefaultsInfos() {
	defaults := map[string]string{}

	switch ri.Type {
	case "imap":
		defaults = map[string]string{
			"lastseenuid":  "",
			"lastsync":     "",   // RFC3339 date string
			"password":     "",   // credentials, SHOULD NOT BE HERE !! TODO.
			"pollinterval": "15", // how often remote account should be polled, in minutes.
			"server":       "",   // server hostname[|port]
			"uidvalidity":  "",   // uidvalidity to invalidate data if needed (see RFC4549#section-4.1)
			"username":     "",   // credentials
		}
	}

	if ri.Infos == nil {
		(*ri).Infos = defaults
	} else {
		for default_key, default_value := range defaults {
			if v, ok := ri.Infos[default_key]; !ok || v == "" {
				(*ri).Infos[default_key] = default_value
			}
		}
	}

	if ri.Status == "" {
		(*ri).Status = "active"
	}

	// try to set identifier if it is missing
	if ri.Identifier == "" {
		switch ri.Type {
		case "imap":
			(*ri).Identifier = ri.Infos["username"]
		}
	}
}

func (ri *RemoteIdentity) UnmarshalCQLMap(input map[string]interface{}) error {
	if dn, ok := input["display_name"].(string); ok {
		ri.DisplayName = dn
	}
	if identifier, ok := input["identifier"].(string); ok {
		ri.Identifier = identifier
	}
	if infos, ok := input["infos"].(map[string]string); ok {
		ri.Infos = make(map[string]string)
		for k, v := range infos {
			ri.Infos[k] = v
		}
	}
	if lc, ok := input["last_check"].(time.Time); ok {
		ri.LastCheck = lc
	}
	if status, ok := input["status"].(string); ok {
		ri.Status = status
	}
	if t, ok := input["type"].(string); ok {
		ri.Type = t
	}
	if userid, ok := input["user_id"].(gocql.UUID); ok {
		ri.UserId.UnmarshalBinary(userid.Bytes())
	}
	return nil
}

func (ri *RemoteIdentity) MarshalFrontEnd() ([]byte, error) {
	return JSONMarshaller("frontend", ri)
}

// Sort interface implementations
type BySocialIdentityID []SocialIdentity

func (p BySocialIdentityID) Len() int {
	return len(p)
}

func (p BySocialIdentityID) Less(i, j int) bool {
	return p[i].SocialId.String() < p[j].SocialId.String()
}

func (p BySocialIdentityID) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}

type ByIdentifier []Identity

func (p ByIdentifier) Len() int {
	return len(p)
}

func (p ByIdentifier) Less(i, j int) bool {
	return p[i].Identifier < p[j].Identifier
}

func (p ByIdentifier) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}
