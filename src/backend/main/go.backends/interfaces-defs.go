package backends

import (
	"github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
)

/**** Users ****/
type UserStorage interface {
	Get(*objects.User) error
}

type UserNameStorage interface {
	IsAvailable(username string) (bool, error)
}

/**** LDA ****/
type LDABackend interface {
	GetRecipients([]string) ([]string, error)
	StoreRaw(data string) (raw_id string, err error)
}
