/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

// vault_client provides an interface to interact with HashiCorp Vault server

package vault

import (
	"fmt"
	hvault "github.com/hashicorp/vault/api"
)

type HVaultClient struct {
	hclient *hvault.Client
	HVaultConfig
}

type HVaultConfig struct {
	Url      string `mapstructure:"url"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

const credentialsPath = "secret/data/remoteid/credentials/%s/%s" // path to store credentials => secret/data/remoteid/credentials/user_id/remote_id
const loginPath = "auth/userpass/login/%s"

// InitializeVaultBackend checks if a Vault server is available and returns an authenticated VaultClient
func InitializeVaultBackend(hvConf HVaultConfig) (hv HVault, err error) {
	config := hvault.DefaultConfig()
	config.Address = hvConf.Url

	var hc HVaultClient

	hc.Url = hvConf.Url
	hc.Username = hvConf.Username
	hc.Password = hvConf.Password

	hc.hclient, err = hvault.NewClient(config)
	if err != nil {
		return nil, err
	}

	//authentication with user/password method
	options := map[string]interface{}{
		"password": hvConf.Password,
	}
	path := fmt.Sprintf(loginPath, hvConf.Username)
	secret, err := hc.hclient.Logical().Write(path, options)
	if err != nil {
		return nil, err
	}
	hc.hclient.SetToken(secret.Auth.ClientToken)

	//TODO: manage token expiration (default TTL is 32 days)

	_, err = hc.hclient.Sys().Health()
	if err != nil {
		return nil, err
	}

	return &hc, nil
}
