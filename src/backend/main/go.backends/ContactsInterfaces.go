/*
 * // Copyleft (ɔ) 2017 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type ContactStorage interface {
	CreateContact(contact *Contact) error
	RetrieveContact(user_id, contact_id string) (contact *Contact, err error)
	UpdateContact(contact, oldContact *Contact, fields map[string]interface{}) error
	DeleteContact(contact *Contact) error
}

type ContactIndex interface {
	CreateContact(contact *Contact) error
	DeleteContact(contact *Contact) error
	UpdateContact(user *UserInfo, contact *Contact, fields map[string]interface{}) error
	FilterContacts(search IndexSearch) (Contacts []*Contact, totalFound int64, err error)
}
