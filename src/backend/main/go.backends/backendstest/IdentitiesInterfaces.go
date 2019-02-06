// Copyleft (ɔ) 2019 The Mailden contributors.
// Use of this source code is governed by a GNU GENERAL PUBLIC
// license (GPL) that can be found in the LICENSE file.

// Package backendstest provides utilities and interfaces for mocking backends interfaces
package backendstest

import (
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

// IdentitiesStorage and IdentityStorageUpdater implementation
type IdentitiesInterface struct {
	localIdentities  []*UserIdentity
	remoteIdentities []*UserIdentity
}

// GetIdentitiesInterface returns an IdentitiesInterface implementing all IdentitiesStorage interfaces
// serving default testdata unless some data are provided in params arrays
func GetIdentitiesInterface(locals, remotes []*UserIdentity) *IdentitiesInterface {
	i := IdentitiesInterface{}
	if len(locals) > 0 {
		i.localIdentities = locals
	} else {
		i.localIdentities = localIdentities
	}
	if len(remotes) > 0 {
		i.remoteIdentities = remotes
	} else {
		i.remoteIdentities = remoteIdentities
	}

	return &i
}

func (ii *IdentitiesInterface) RetrieveLocalsIdentities(user_id string) ([]UserIdentity, error) {
	locals := []UserIdentity{}
	for _, local := range ii.localIdentities {
		locals = append(locals, *local)
	}
	return locals, nil
}
func (ii *IdentitiesInterface) CreateUserIdentity(userIdentity *UserIdentity) CaliopenError {
	return NewCaliopenErr(NotImplementedCaliopenErr, "test interface not implemented")
}
func (ii *IdentitiesInterface) RetrieveUserIdentity(userId, RemoteId string, withCredentials bool) (*UserIdentity, error) {
	return nil, errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) LookupIdentityByIdentifier(string, ...string) ([][2]string, error) {
	return [][2]string{}, errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) LookupIdentityByType(string, ...string) ([][2]string, error) {
	return [][2]string{}, errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) UpdateUserIdentity(userIdentity *UserIdentity, fields map[string]interface{}) error {
	return errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) DeleteUserIdentity(userIdentity *UserIdentity) error {
	return errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) RetrieveRemoteIdentities(userId string, withCredentials bool) ([]*UserIdentity, error) {
	return nil, errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) RetrieveAllRemotes(withCredentials bool) (<-chan *UserIdentity, error) {
	ch := make(chan *UserIdentity)
	go func() {
		for _, remote := range ii.remoteIdentities {
			ch <- remote
		}
		close(ch)
	}()
	return ch, nil
}
func (ii *IdentitiesInterface) UpdateRemoteInfosMap(userId, remoteId string, infos map[string]string) error {
	return errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) RetrieveRemoteInfosMap(userId, remoteId string) (infos map[string]string, err error) {
	return map[string]string{}, errors.New("test interface not implemented")
}
func (ii *IdentitiesInterface) IsLocalIdentity(userId, identityId string) bool {
	return false
}
func (ii *IdentitiesInterface) IsRemoteIdentity(userId, identityId string) bool {
	return false
}
func (ii *IdentitiesInterface) Close() {

}
