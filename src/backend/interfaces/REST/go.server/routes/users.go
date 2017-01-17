// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package rest_api

import (
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.main/hub"
)

// GET …/user/:id
func GetUserById(userId int64) Response {
	query := obj.GetUserByIdQuery{Id: userId}

	err := hub.Dispatch(query)
}
