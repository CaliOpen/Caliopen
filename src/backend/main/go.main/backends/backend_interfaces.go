package backends

import (
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.main/users"
)

type UserStorage interface {
	Get(*users.User) error
}

type UserNameStorage interface {
	IsAvailable(username string) (bool, error)
}