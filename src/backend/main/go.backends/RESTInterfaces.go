// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type ConfigStorage interface {
	RetrievePrivacyFeatures() ([]PrivacyFeature, error)
}

type APIStorage interface {
	ConfigStorage
	AttachmentStorage
	CredentialsStorage
	ContactStorage
	DevicesStorage
	IdentityStorage
	KeysStorage
	MessageStorage
	TagsStorage
	UserNameStorage
	UserStorage
}

type APIIndex interface {
	MessageIndex
	ContactIndex
	RecipientsSuggest(user *UserInfo, query_string string) (suggests []RecipientSuggestion, err error)
	Search(search IndexSearch) (result *IndexResult, err error)
}

type APICache interface {
	// authentication
	GetAuthToken(token string) (value *Auth_cache, err error)
	LogoutUser(key string) error
	// password reset process
	GetResetPasswordToken(token string) (*Pass_reset_session, error)
	GetResetPasswordSession(user_id string) (*Pass_reset_session, error)
	SetResetPasswordSession(user_id, reset_token string) (*Pass_reset_session, error)
	DeleteResetPasswordSession(user_id string) error
	// Oauth session handling
	SetOauthSession(key string, session *OauthSession) error
	GetOauthSession(key string) (*OauthSession, error)
	DeleteOauthSession(user_id string) error
}
