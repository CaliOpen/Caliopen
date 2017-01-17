// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"github.com/gocql/gocql"
)

type RawMessageModel struct {
	Raw_msg_id gocql.UUID `cql:"raw_msg_id"`
	Data       string     `cql:"data"`
}
