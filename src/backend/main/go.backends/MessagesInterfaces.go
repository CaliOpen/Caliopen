package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type MessageStorage interface {
	CreateMessage(msg *Message) error
	RetrieveMessage(user_id, msg_id string) (msg *Message, err error)
	UpdateMessage(msg *Message, fields map[string]interface{}) error // 'fields' are the struct fields names that have been modified
	DeleteMessage(msg *Message) error
	SetMessageUnread(user_id, message_id string, status bool) error
	GetRawMessage(raw_message_id string) (raw_message RawMessage, err error)
}

type MessageIndex interface {
	SetMessageUnread(user *UserInfo, message_id string, status bool) error
	CreateMessage(user *UserInfo, msg *Message) error
	UpdateMessage(user *UserInfo, msg *Message, fields map[string]interface{}) error
	FilterMessages(search IndexSearch) (messages []*Message, totalFound int64, err error)
}
