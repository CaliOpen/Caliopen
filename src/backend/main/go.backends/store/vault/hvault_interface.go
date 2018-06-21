/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

// interfaces definition to Hashicorp Vault server
package vault

// As of june 2018, only one interface for CRUD operation on credentials. Later on, we may add Cubbyhole secrets engine, databases secret engine and so on…
type HVault interface {
	VaultCredentials
}
