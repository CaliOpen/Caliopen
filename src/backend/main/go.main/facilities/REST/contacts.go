/*
 * // Copyleft (ɔ) 2017 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package REST

import (
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/helpers"
	"github.com/bitly/go-simplejson"
	"github.com/pkg/errors"
	"github.com/satori/go.uuid"
	"strings"
	"sync"
	"time"
)

// CreateContact validates Contact before saving it to cassandra and ES
func (rest *RESTfacility) CreateContact(contact *Contact) (err error) {
	// add missing properties
	contact.ContactId.UnmarshalBinary(uuid.NewV4().Bytes())
	contact.DateInsert = time.Now()
	contact.DateUpdate = contact.DateInsert

	// normalization
	helpers.ComputeNewTitle(contact)
	helpers.NormalizePhoneNumbers(contact)
	MarshalNested(contact)
	MarshalRelated(contact)

	// concurrent creation in db & index
	wg := new(sync.WaitGroup)
	wg.Add(2)
	errGroup := new([]string)
	mx := new(sync.Mutex)
	go func(wg *sync.WaitGroup, errGroup *[]string, mx *sync.Mutex) {
		err = rest.store.CreateContact(contact)
		if err != nil {
			mx.Lock()
			*errGroup = append(*errGroup, err.Error())
			mx.Unlock()
		}
		wg.Done()
	}(wg, errGroup, mx)

	go func(wg *sync.WaitGroup, errGroup *[]string, mx *sync.Mutex) {
		err = rest.index.CreateContact(contact)
		if err != nil {
			mx.Lock()
			*errGroup = append(*errGroup, err.Error())
			mx.Unlock()
		}
		wg.Done()
	}(wg, errGroup, mx)

	wg.Wait()
	if len(*errGroup) > 0 {
		return fmt.Errorf("%s", strings.Join(*errGroup, " / "))
	}

	// notify external components
	go func(contact *Contact) {
		const updatePI_order = "contact_update"
		natsMessage := fmt.Sprintf(Nats_contact_tmpl, updatePI_order, contact.ContactId.String(), contact.UserId.String())
		rest.PublishOnNats(natsMessage, rest.natsTopics[Nats_Contacts_topicKey])
	}(contact)

	return nil
}

// RetrieveContacts returns contacts from index given filter params
func (rest *RESTfacility) RetrieveContacts(filter IndexSearch) (contacts []*Contact, totalFound int64, err error) {

	contacts, totalFound, err = rest.index.FilterContacts(filter)
	if err != nil {
		return []*Contact{}, 0, err
	}

	return
}

func (rest *RESTfacility) RetrieveContact(userID, contactID string) (contact *Contact, err error) {
	return rest.store.RetrieveContact(userID, contactID)
}

// PatchContact is a shortcut for REST api to :
// - retrieve the contact from db
// - UpdateWithPatch()
// - then UpdateContact() to save updated contact to stores & index if everything went good.
func (rest *RESTfacility) PatchContact(patch []byte, userID, contactID string) error {

	current_contact, err := rest.RetrieveContact(userID, contactID)
	if err != nil {
		if err.Error() == "not found" {
			return NewCaliopenErr(NotFoundCaliopenErr, "[RESTfacility] contact not found")
		} else {
			return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] PatchContact failed to retrieve contact")
		}
	}

	// read into the patch to make basic controls before processing it with generic helper
	patchReader, err := simplejson.NewJson(patch)
	if err != nil {
		return WrapCaliopenErrf(err, FailDependencyCaliopenErr, "[RESTfacility] PatchTag failed with simplejson error : %s", err)
	}
	// forbid tags modification immediately
	if _, hasTagsProp := patchReader.CheckGet("tags"); hasTagsProp {
		return NewCaliopenErr(ForbiddenCaliopenErr, "[RESTfacility] PatchContact : patching tags through parent object is forbidden")
	}
	// checks "current_state" property is present
	if _, hasCurrentState := patchReader.CheckGet("current_state"); !hasCurrentState {
		return NewCaliopenErr(ForbiddenCaliopenErr, "[RESTfacility] PatchContact : current_state property must be in patch")
	}

	// patch seams OK, apply it to the resource
	var modifiedFields map[string]interface{}
	newContact, modifiedFields, err := helpers.UpdateWithPatch(patch, current_contact, UserActor)
	if err != nil {
		return err
	}

	// check if title has to be re-computed
	needNewTitle := false
	for key, _ := range modifiedFields {
		switch key {
		case "AdditionalName", "FamilyName", "GivenName", "NamePrefix", "NameSuffix":
			needNewTitle = true
			break
		}
	}
	if needNewTitle {
		helpers.ComputeTitle(newContact.(*Contact))
		modifiedFields["Title"] = newContact.(*Contact).Title
	}

	// save updated resource
	err = rest.UpdateContact(newContact.(*Contact), current_contact, modifiedFields)
	if err != nil {
		return WrapCaliopenErrf(err, FailDependencyCaliopenErr, "[RESTfacility] PatchContact failed with UpdateContact error : %s", err)
	}

	return nil

}

// UpdateContact updates a contact in store & index with payload
func (rest *RESTfacility) UpdateContact(contact, oldContact *Contact, modifiedFields map[string]interface{}) error {

	err := rest.store.UpdateContact(contact, oldContact, modifiedFields)
	if err != nil {
		return err
	}

	err = rest.index.UpdateContact(contact, modifiedFields)
	if err != nil {
		return err
	}

	// notify external components
	go func(contact *Contact) {
		const update_order = "contact_update"
		natsMessage := fmt.Sprintf(Nats_contact_tmpl, update_order, contact.ContactId.String(), contact.UserId.String())
		rest.PublishOnNats(natsMessage, rest.natsTopics[Nats_Contacts_topicKey])
	}(contact)

	return nil
}

// DeleteContact deletes a contact in store & index, only if :
// - contact belongs to user ;-)
// - contact is not the user's contact card
func (rest *RESTfacility) DeleteContact(userID, contactID string) error {
	user, err := rest.store.RetrieveUser(userID)
	if err != nil {
		return err
	}
	contact, err := rest.store.RetrieveContact(userID, contactID)
	if err != nil {
		return err
	}

	if user.ContactId == contact.ContactId {
		return errors.New("can't delete contact card related to user")
	}

	// parallel deletion in db & index
	wg := new(sync.WaitGroup)
	wg.Add(2)
	errGroup := new([]string)
	mx := new(sync.Mutex)
	go func(wg *sync.WaitGroup, errGroup *[]string, mx *sync.Mutex) {
		err = rest.store.DeleteContact(contact)
		if err != nil {
			mx.Lock()
			*errGroup = append(*errGroup, err.Error())
			mx.Unlock()
		}
		wg.Done()
	}(wg, errGroup, mx)

	go func(wg *sync.WaitGroup, errGroup *[]string, mx *sync.Mutex) {
		err = rest.index.DeleteContact(contact)
		if err != nil {
			mx.Lock()
			*errGroup = append(*errGroup, err.Error())
			mx.Unlock()
		}
		wg.Done()
	}(wg, errGroup, mx)

	wg.Wait()
	if len(*errGroup) > 0 {
		return fmt.Errorf("%s", strings.Join(*errGroup, " / "))
	}
	return nil
}
