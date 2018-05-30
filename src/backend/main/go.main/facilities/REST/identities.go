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
	"net/http"
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

func (rest *RESTfacility) RetrieveRemoteIdentities(userId string) (ids []*RemoteIdentity, err CaliopenError) {
	var e error
	ids, e = rest.store.RetrieveRemoteIdentities(userId)
	if e != nil {
		err = WrapCaliopenErr(e, http.StatusFailedDependency, "store failed to retrieve remote ids")
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

	// set defaults
	identity.SetDefaultsInfos()

	// identifier should not be empty at this stage
	if identity.Identifier == "" {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[CreateRemoteIdentity] empty remote identity.identifier")
	}

	err := rest.store.CreateRemoteIdentity(identity)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[CreateRemoteIdentity] CreateRemoteIdentity failed to create identity in store")
	}

	return nil
}

func (rest *RESTfacility) RetrieveRemoteIdentity(userId, identifier string) (id *RemoteIdentity, err CaliopenError) {
	var e error
	id, e = rest.store.RetrieveRemoteIdentity(userId, identifier)
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
	return nil
}

func (rest *RESTfacility) PatchRemoteIdentity(patch []byte, userId, identifier string) CaliopenError {
	currentRemoteID, err1 := rest.RetrieveRemoteIdentity(userId, identifier)
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

func (rest *RESTfacility) DeleteRemoteIdentity(userId, identifier string) CaliopenError {
	return nil
}
