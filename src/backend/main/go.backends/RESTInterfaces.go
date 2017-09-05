// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"io"
)

type APIStorage interface {
	UserNameStorage
	//messages
	GetMessage(user_id, msg_id string) (msg *Message, err error)
	UpdateMessage(msg *Message, fields map[string]interface{}) error
	SetMessageUnread(user_id, message_id string, status bool) error
	GetRawMessage(raw_message_id string) (raw_message RawMessage, err error)
	//attachments
	StoreAttachment(attachment_id string, file io.Reader) (uri string, size int, err error)
	GetAttachment(uri string) (file io.Reader, err error)
	DeleteAttachment(uri string) error
	//identities
	GetLocalsIdentities(user_id string) (identities []LocalIdentity, err error)
	//contacts
	GetContact(user_id, contact_id string) (*Contact, error)
	//tags
	RetrieveUserTags(user_id string) (tags []Tag, err error)
	CreateTag(tag *Tag) error
	RetrieveTag(user_id, tag_id string) (tag Tag, err error)
	UpdateTag(tag *Tag) error
	DeleteTag(user_id, tag_id string) error
}

type APIIndex interface {
	SetMessageUnread(user_id, message_id string, status bool) error
	UpdateMessage(msg *Message, fields map[string]interface{}) error
	RecipientsSuggest(user_id, query_string string) (suggests []RecipientSuggestion, err error)
	FilterMessages(MessagesListFilter) ([]*Message, error)
}
