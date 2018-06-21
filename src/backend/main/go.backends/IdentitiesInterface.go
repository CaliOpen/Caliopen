/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type (
	IdentityStorage interface {
		RetrieveLocalsIdentities(user_id string) ([]LocalIdentity, error)
		CreateRemoteIdentity(rId *RemoteIdentity) CaliopenError
		RetrieveRemoteIdentity(userId, RemoteId string, withCredentials bool) (*RemoteIdentity, error)
		UpdateRemoteIdentity(rId *RemoteIdentity, fields map[string]interface{}) error
		DeleteRemoteIdentity(rId *RemoteIdentity) error
		RetrieveRemoteIdentities(userId string, withCredentials bool) ([]*RemoteIdentity, error)
		RetrieveAllRemotes(withCredentials bool) (<-chan *RemoteIdentity, error)
		Close()
	}
)
