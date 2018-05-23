// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	"context"
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/pi"
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
	return nil
}

func (rest *RESTfacility) DeleteRemoteIdentity(userId, identifier string) CaliopenError {
	return nil
}
