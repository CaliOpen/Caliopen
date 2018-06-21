// Copyleft (ɔ) 2018 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// only struct and interfaces definitions in this pkg

package objects

type ActionsPayload struct {
	Actions []string `json:"actions"`
	Params  *struct {
		Password    string `json:"password"`
		AccessToken string
	} `json:"params"`
	UserId string
}
