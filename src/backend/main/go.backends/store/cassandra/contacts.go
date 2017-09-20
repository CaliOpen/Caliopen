// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

//******for testing purpose*******

package store

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

func (cb *CassandraBackend) GetContact(user_id, contact_id string) (contact *Contact, err error) {
	contact = &Contact{}
	m := map[string]interface{}{}
	q := cb.Session.Query(`SELECT * FROM contact WHERE user_id = ? AND contact_id = ?`, user_id, contact_id)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	contact.UnmarshalCQLMap(m)
	// retrieve public keys for this contact and
	// add keys to contact object.
	var keys []map[string]interface{}
	keys, err = cb.Session.Query(`SELECT * FROM public_key WHERE user_id = ? AND contact_id = ?`, user_id, contact_id).Iter().SliceMap()
	for _, key := range keys {
		pk := &PublicKey{}
		pk.UnmarshalCQLMap(key)
		contact.PublicKeys = append(contact.PublicKeys, *pk)
	}

	return contact, err
}

func (cb *CassandraBackend) LookupContactsByIdentifier(user_id, address string) (contact_ids []string, err error) {
	err = cb.Session.Query(`SELECT contact_ids FROM contact_lookup WHERE user_id=? and value=? and type='email'`, user_id, address).Scan(&contact_ids)
	return
}
