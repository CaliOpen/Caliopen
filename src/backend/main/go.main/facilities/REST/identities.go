// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	"bytes"
	"context"
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/helpers"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/pi"
	"github.com/bitly/go-simplejson"
	"github.com/satori/go.uuid"
)

func (rest *RESTfacility) RetrieveLocalsIdentities(user_id string) ([]LocalIdentity, error) {
	return rest.store.RetrieveLocalsIdentities(user_id)
}

// get contact from db
// aggregate contact's identities
// then update PI for each identity
func (rest *RESTfacility) RetrieveContactIdentities(user_id, contact_id string) (identities []ContactIdentity, err error) {
	_, e := uuid.FromString(contact_id)
	if user_id != "" && contact_id != "" && e == nil {
		contact, err := rest.store.RetrieveContact(user_id, contact_id)
		if err != nil || contact == nil {
			err = errors.New("[RESTfacility.ContactIdentities] error when retrieving contact : " + err.Error())
			return []ContactIdentity{}, err
		}

		for _, email := range contact.Emails {
			identities = append(identities, ContactIdentity{
				Identifier:   email.Address,
				Label:        email.Label,
				PrivacyIndex: PrivacyIndex{},
				Protocol:     EmailProtocol,
			})
		}

		for _, identity := range contact.Identities {
			identities = append(identities, ContactIdentity{
				Identifier:   identity.Name,
				Label:        identity.Name,
				PrivacyIndex: PrivacyIndex{},
				Protocol:     identity.Type,
			})

		}

		for _, im := range contact.Ims {
			identities = append(identities, ContactIdentity{
				Identifier:   im.Address,
				Label:        im.Label,
				PrivacyIndex: PrivacyIndex{},
				Protocol:     im.Protocol,
			})
		}

		for _, phone := range contact.Phones {
			identities = append(identities, ContactIdentity{
				Identifier:   phone.Number,
				Label:        phone.Number,
				PrivacyIndex: PrivacyIndex{},
				Protocol:     SmsProtocol,
			})
		}

		for i := range identities {
			// (for now, this func is a monkey)
			pi.UpdatePIContactIdentity(context.TODO(), contact, &identities[i]) // TODO: do not use context pkg, it is not for this king of context
		}
	} else {
		err = errors.New("[RESTfacility.ContactIdentities] unprocessable parameters")
		return
	}
	return
}

func (rest *RESTfacility) RetrieveRemoteIdentities(userId string, withCredentials bool) (ids []*RemoteIdentity, err CaliopenError) {
	var e error
	ids, e = rest.store.RetrieveRemoteIdentities(userId, withCredentials)
	if e != nil {
		if e.Error() == "remote ids not found" {
			err = WrapCaliopenErr(e, NotFoundCaliopenErr, "store did not found remote ids")
		} else {
			err = WrapCaliopenErr(e, DbCaliopenErr, "store failed to retrieve remote ids")
		}
	}
	return
}

func (rest *RESTfacility) CreateRemoteIdentity(identity *RemoteIdentity) CaliopenError {
	// check if mandatory properties are ok
	if len(identity.UserId) == 0 || (bytes.Equal(identity.UserId.Bytes(), EmptyUUID.Bytes())) {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[CreateRemoteIdentity] empty user id")
	}
	if identity.Type == "" {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[CreateRemoteIdentity] empty remote identity.type")
	}

	(*identity).RemoteId.UnmarshalBinary(uuid.NewV4().Bytes())

	// set defaults
	identity.SetDefaults()

	err := rest.store.CreateRemoteIdentity(identity)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[CreateRemoteIdentity] CreateRemoteIdentity failed to create identity in store")
	}

	return nil
}

func (rest *RESTfacility) RetrieveRemoteIdentity(userId, remoteId string, withCredentials bool) (id *RemoteIdentity, err CaliopenError) {
	var e error
	id, e = rest.store.RetrieveRemoteIdentity(userId, remoteId, withCredentials)
	if e != nil {
		if e.Error() == "not found" {
			err = WrapCaliopenErr(e, NotFoundCaliopenErr, "remote identity not found")
		} else {
			err = WrapCaliopenErr(e, DbCaliopenErr, "store failed to retrieve remote identity")
		}
	}
	return
}

func (rest *RESTfacility) UpdateRemoteIdentity(identity, oldIdentity *RemoteIdentity, update map[string]interface{}) CaliopenError {
	err := rest.store.UpdateRemoteIdentity(identity, update)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateRemoteIdentity fails to call store")
	}
	return nil
}

func (rest *RESTfacility) PatchRemoteIdentity(patch []byte, userId, remoteId string) CaliopenError {
	currentRemoteID, err1 := rest.RetrieveRemoteIdentity(userId, remoteId, true)
	if err1 != nil {
		if err1.Error() == "not found" {
			return WrapCaliopenErr(err1, NotFoundCaliopenErr, "remote identity not found")
		} else {
			return WrapCaliopenErr(err1, DbCaliopenErr, "store failed to retrieve remote identity")
		}
	}
	// read into the patch to make basic controls before processing it with generic helper
	patchReader, err2 := simplejson.NewJson(patch)
	if err2 != nil {
		return WrapCaliopenErrf(err2, FailDependencyCaliopenErr, "[RESTfacility] PatchRemoteIdentity failed with simplejson error : %s", err2)
	}
	// checks "current_state" property is present
	if _, hasCurrentState := patchReader.CheckGet("current_state"); !hasCurrentState {
		return NewCaliopenErr(ForbiddenCaliopenErr, "[RESTfacility] PatchRemoteIdentity : current_state property must be in patch")
	}

	// special case : updating credentials. Credentials' current state should not be provided by caller.
	// we need to get current credentials from db and put them in "current_state" before applying generic UpdateWithPatch()
	if _, hasCredentials := patchReader.CheckGet("credentials"); hasCredentials {
		patchReader.SetPath([]string{"current_state", "credentials"}, currentRemoteID.Credentials)
		patch, _ = patchReader.MarshalJSON()
	}

	// patch seams OK, apply it to the resource
	newRemoteID, modifiedFields, err3 := helpers.UpdateWithPatch(patch, currentRemoteID, UserActor)
	if err3 != nil {
		return WrapCaliopenErrf(err3, FailDependencyCaliopenErr, "[RESTfacility] PatchRemoteIdentity : call to generic UpdateWithPatch failed : %s", err3)
	}

	// save updated resource
	err4 := rest.UpdateRemoteIdentity(newRemoteID.(*RemoteIdentity), currentRemoteID, modifiedFields)
	if err4 != nil {
		return WrapCaliopenErrf(err4, FailDependencyCaliopenErr, "[RESTfacility] PatchRemoteIdentity failed with UpdateRemoteIdentity error : %s", err4)
	}

	return nil
}

func (rest *RESTfacility) DeleteRemoteIdentity(userId, remoteId string) CaliopenError {
	remoteID, err1 := rest.RetrieveRemoteIdentity(userId, remoteId, false)
	if err1 != nil {
		if err1.Error() == "not found" {
			return WrapCaliopenErr(err1, NotFoundCaliopenErr, "remote identity not found")
		} else {
			return WrapCaliopenErr(err1, DbCaliopenErr, "store failed to retrieve remote identity")
		}
	}

	err2 := rest.store.DeleteRemoteIdentity(remoteID)
	if err2 != nil {
		return WrapCaliopenErrf(err2, DbCaliopenErr, "[RESTfacility DeleteRemoteIdentity failed to delete in store")
	}

	return nil
}
