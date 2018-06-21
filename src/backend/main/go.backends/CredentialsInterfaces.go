/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type CredentialsStorage interface {
	CreateCredentials(rId *RemoteIdentity, cred Credentials) error
	RetrieveCredentials(userId, remoteId string) (Credentials, error)
	UpdateCredentials(userId, remoteId string, cred Credentials) error
	DeleteCredentials(userId, remoteId string) error
}
