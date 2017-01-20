package backends

import (
	"github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
)

type (
	/**** Users ****/
	UserStorage interface {
		Get(*objects.User) error
	}
	UserNameStorage interface {
		IsAvailable(username string) (bool, error)
	}

	/**** HTTP REST API ****/
	APIStorage interface {
		UserNameStorage
	}

	/**** LDA ****/
	LDABackend interface {
		GetRecipients([]string) ([]string, error)
		StoreRaw(data string) (raw_id string, err error)
	}
)
