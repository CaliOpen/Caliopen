// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type APIStorage interface {
	AttachmentStorage
	ContactStorage
	IdentityStorage
	MessageStorage
	TagsStorage
	UserNameStorage
	UserStorage
	DevicesStorage
}

type APIIndex interface {
	MessageIndex
	ContactIndex
	RecipientsSuggest(user_id, query_string string) (suggests []RecipientSuggestion, err error)
	Search(search IndexSearch) (result *IndexResult, err error)
}

type APICache interface {
	// authentication
	GetAuthToken(token string) (value *Auth_cache, err error)
	// password reset process
	GetResetPasswordToken(token string) (*Pass_reset_session, error)
	GetResetPasswordSession(user_id string) (*Pass_reset_session, error)
	SetResetPasswordSession(user_id, reset_token string) (*Pass_reset_session, error)
	DeleteResetPasswordSession(user_id string) error
}
