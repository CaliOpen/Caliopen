/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package vault

import (
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type VaultCredentials interface {
	CreateCredentials(rId *RemoteIdentity, cred Credentials) error
	RetrieveCredentials(userId, remoteId string) (Credentials, error)
	UpdateCredentials(userId, remoteId string, cred Credentials) error
	DeleteCredentials(userId, remoteId string) error
}

func (vault *HVaultClient) CreateCredentials(rId *RemoteIdentity, cred Credentials) error {
	return vault.UpdateCredentials(rId.UserId.String(), rId.RemoteId.String(), cred)
}

// RetrieveCrendentials gets credentials from vault, if application has read rights on vault
func (vault *HVaultClient) RetrieveCredentials(userId, remoteId string) (cred Credentials, err error) {
	cred = Credentials{}
	path := fmt.Sprintf(credentialsPath, userId, remoteId)
	secret, err := vault.hclient.Logical().Read(path)
	if err != nil {
		return
	}
	if secret == nil || secret.Data == nil {
		// secret not found
		err = errors.New("secret not found")
		return
	}

	data, ok := secret.Data["data"]
	if !ok {
		err = errors.New("secret not found")
		return
	}
	// Credentials is a map[string]string
	// only copy values from secret.Data that are strings
	for k, v := range data.(map[string]interface{}) {
		switch v.(type) {
		case string:
			cred[k] = v.(string)
		default:
			continue
		}
	}
	return
}

func (vault *HVaultClient) UpdateCredentials(userId, remoteId string, cred Credentials) error {
	payload := make(map[string]interface{})
	payload["data"] = cred
	path := fmt.Sprintf(credentialsPath, userId, remoteId)
	_, err := vault.hclient.Logical().Write(path, payload)
	return err
}

func (vault *HVaultClient) DeleteCredentials(userId, remoteId string) error {
	path := fmt.Sprintf(credentialsPath, userId, remoteId)
	_, err := vault.hclient.Logical().Delete(path)
	return err
}
