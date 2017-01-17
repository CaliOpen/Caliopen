// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// UserStorage interface implementation for cassandra backend

package store

import (
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
)

func (cb *CassandraBackend) Get(*obj.User) error {
	return nil
}
