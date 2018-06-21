// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type (
	UserStorage interface {
		GetSettings(user_id string) (settings *Settings, err error)
		RetrieveUser(user_id string) (user *User, err error)
		UpdateUserPasswordHash(user *User) error
		UpdateUser(user *User, fields map[string]interface{}) error // 'fields' are the struct fields names that have been modified
		UserByRecoveryEmail(email string) (user *User, err error)
		DeleteUser(user_id string) error
	}
	UserNameStorage interface {
		UsernameIsAvailable(username string) (bool, error)
		UserByUsername(username string) (user *User, err error)
	}
)
