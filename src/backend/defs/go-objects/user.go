// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// only struct and interfaces definitions in this pkg

package objects

type User struct {
}

/* Queries */
/////////////
type GetUserByIdQuery struct {
	Id     int64
	Result *User
}

/* Procedures */
////////////////
type ApplyUserPatchProc struct {
	Id int64
}