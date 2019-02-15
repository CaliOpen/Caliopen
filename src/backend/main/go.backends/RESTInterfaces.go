// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type APIStorage interface {
	AttachmentStorage
	CredentialsStorage
	ContactStorage
	DevicesStorage
	DiscussionStorage
	IdentityStorage
	KeysStorage
	MessageStorage
	ParticipantStorage
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
