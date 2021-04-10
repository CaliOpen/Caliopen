// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/helpers"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/pi"
	log "github.com/Sirupsen/logrus"
	"github.com/bitly/go-simplejson"
	"github.com/satori/go.uuid"
)

func (rest *RESTfacility) RetrieveLocalIdentities(user_id string) ([]UserIdentity, error) {
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

func (rest *RESTfacility) RetrieveRemoteIdentities(userId string, withCredentials bool) (ids []*UserIdentity, err CaliopenError) {
	var e error
	ids, e = rest.store.RetrieveRemoteIdentities(userId, withCredentials)
	if e != nil {
		if e.Error() == "not found" {
			err = WrapCaliopenErr(e, NotFoundCaliopenErr, "store did not found remote ids")
		} else {
			err = WrapCaliopenErr(e, DbCaliopenErr, "store failed to retrieve remote ids")
		}
	}
	return
}

// CreateUserIdentity wraps the following actions :
// - checks UserIdentity correctness
// - adds UserIdentity in cassandra's tables
// - adds identity to user's contact entry
// - emits nats message toward identity poller
func (rest *RESTfacility) CreateUserIdentity(identity *UserIdentity) CaliopenError {
	// check if mandatory properties are ok
	if len(identity.UserId.Bytes()) == 0 || (bytes.Equal(identity.UserId.Bytes(), EmptyUUID.Bytes())) {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[CreateUserIdentity] empty user id")
	}
	if identity.Type == "" || identity.Protocol == "" || identity.Identifier == "" {
		return NewCaliopenErr(UnprocessableCaliopenErr, "[CreateUserIdentity] miss mandatory property")
	}

	if len((*identity).Id.Bytes()) == 0 || (bytes.Equal((*identity).Id.Bytes(), EmptyUUID.Bytes())) {
		_ = (*identity).Id.UnmarshalBinary(uuid.NewV4().Bytes())
	}
	// set defaults
	identity.SetDefaults()

	// ensure identifier+protocol+user_id uniqueness
	rows, e := rest.store.LookupIdentityByIdentifier(identity.Identifier, identity.Protocol, identity.UserId.String())
	if e != nil || len(rows) > 0 {
		return NewCaliopenErrf(ForbiddenCaliopenErr, "[CreateUserIdentity] tuple(%s, %s, %s) breaks uniqueness constraint", identity.Identifier, identity.Protocol, identity.UserId.String())
	}

	err := rest.store.CreateUserIdentity(identity)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[CreateUserIdentity] CreateUserIdentity failed to create identity in store")
	}

	// emit nats message to idpoller to start polling asap
	if identity.Type == RemoteIdentity {
		order := RemoteIDNatsMessage{
			IdentityId: identity.Id.String(),
			Order:      "add",
			OrderParam: identity.Infos["pollinterval"],
			Protocol:   identity.Protocol,
			UserId:     identity.UserId.String(),
		}
		jorder, jerr := json.Marshal(order)
		if jerr == nil {
			e := rest.nats_conn.Publish(rest.natsTopics[Nats_IdPoller_topicKey], jorder)
			if e != nil {
				log.WithError(e).Warnf("[CreateUserIdentity] failed to publish 'add' order to idpoller")
			}
		}
	}

	// adds identity to user's contact entry
	contact, e := rest.RetrieveUserContact(identity.UserId.String())
	if e != nil {
		log.WithError(e).Warnf("[CreateUserIdentity] failed to retrieve user's contact. Can't add identity to contact.")
		return NewCaliopenErr(NotFoundCaliopenErr, "[CreateUserIdentity] failed to retrieve user's contact. Can't add identity to contact.")
	} else {
		_, err = addIdentityToContact(rest.store, rest.index, rest.store, *identity, contact)
		if err != nil {
			log.WithError(err).Warnf("[CreateUserIdentity] failed to add identity <%s> to user <%s>'s contact <%s>", identity.Id, identity.UserId, contact.ContactId)
			return NewCaliopenErrf(FailDependencyCaliopenErr, "[CreateUserIdentity] failed to add identity <%s> to user <%s>'s contact <%s>", identity.Id, identity.UserId, contact.ContactId)
		}
	}

	return nil
}

func (rest *RESTfacility) RetrieveUserIdentity(userId, identityId string, withCredentials bool) (id *UserIdentity, err CaliopenError) {
	var e error
	id, e = rest.store.RetrieveUserIdentity(userId, identityId, withCredentials)
	if e != nil {
		if e.Error() == "not found" {
			err = WrapCaliopenErr(e, NotFoundCaliopenErr, "remote identity not found")
		} else {
			err = WrapCaliopenErr(e, DbCaliopenErr, "store failed to retrieve remote identity")
		}
	}
	return
}

func (rest *RESTfacility) UpdateUserIdentity(identity, oldIdentity *UserIdentity, update map[string]interface{}) CaliopenError {
	err := rest.store.UpdateUserIdentity(identity, update)
	if err != nil {
		return WrapCaliopenErr(err, DbCaliopenErr, "[RESTfacility] UpdateUserIdentity fails to call store")
	}
	return nil
}

func (rest *RESTfacility) PatchUserIdentity(patch []byte, userId, identityId string) CaliopenError {
	currentRemoteID, err1 := rest.RetrieveUserIdentity(userId, identityId, false)
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
		return WrapCaliopenErrf(err2, FailDependencyCaliopenErr, "[RESTfacility] PatchUserIdentity failed with simplejson error : %s", err2)
	}
	// checks "current_state" property is present
	if _, hasCurrentState := patchReader.CheckGet("current_state"); !hasCurrentState {
		return NewCaliopenErr(ForbiddenCaliopenErr, "[RESTfacility] PatchUserIdentity : current_state property must be in patch")
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
		return WrapCaliopenErrf(err3, FailDependencyCaliopenErr, "[RESTfacility] PatchUserIdentity : call to generic UpdateWithPatch failed : %s", err3)
	}

	// save updated resource
	err4 := rest.UpdateUserIdentity(newRemoteID.(*UserIdentity), currentRemoteID, modifiedFields)
	if err4 != nil {
		return WrapCaliopenErrf(err4, FailDependencyCaliopenErr, "[RESTfacility] PatchUserIdentity failed with UpdateUserIdentity error : %s", err4)
	}

	//TODO: emit nats message to IDpoller if it's a remote identity

	return nil
}

func (rest *RESTfacility) DeleteUserIdentity(userId, identityId string) CaliopenError {
	userIdentity, err1 := rest.RetrieveUserIdentity(userId, identityId, false)
	if err1 != nil {
		if err1.Error() == "not found" {
			return WrapCaliopenErr(err1, NotFoundCaliopenErr, "remote identity not found")
		} else {
			return WrapCaliopenErr(err1, DbCaliopenErr, "store failed to retrieve remote identity")
		}
	}

	err2 := rest.store.DeleteUserIdentity(userIdentity)
	if err2 != nil {
		return WrapCaliopenErrf(err2, DbCaliopenErr, "[RESTfacility DeleteUserIdentity failed to delete in store")
	}

	// send nats message to idpoller to stop polling
	if userIdentity.Type == RemoteIdentity {
		order := RemoteIDNatsMessage{
			IdentityId: userIdentity.Id.String(),
			Order:      "delete",
			Protocol:   userIdentity.Protocol,
			UserId:     userIdentity.UserId.String(),
		}
		jorder, jerr := json.Marshal(order)
		if jerr == nil {
			e := rest.nats_conn.Publish(rest.natsTopics[Nats_IdPoller_topicKey], jorder)
			if e != nil {
				log.WithError(e).Warn("[saveErrorState] failed to publish delete order to idpoller")
			}
		}
	}

	return nil
}

func (rest *RESTfacility) IsRemoteIdentity(userId, identityId string) bool {
	return rest.store.IsRemoteIdentity(userId, identityId)
}
