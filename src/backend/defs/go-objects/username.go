// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

type (
	UserName struct {
		User_id []byte `json:"user_id"`
		Name    string `json:"name"`
	}

	Availability struct {
		Available bool   `json:"available" binding:"required"`
		Username  string `json:"username" binding:"required"`
	}
)
