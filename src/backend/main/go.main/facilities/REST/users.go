// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/facilities/Notifications"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/users"
	"github.com/Sirupsen/logrus"
	"github.com/renstrom/shortuuid"
	"github.com/tidwall/gjson"
	"time"
)

const (
	changePasswordSubject   = "Information Caliopen : votre mot de passe a été changé"
	changePasswordBodyPlain = `
	Caliopen vous informe que le mot de passe de votre compte a été changé.
	`
	changePasswordBodyRich = changePasswordBodyPlain
)

// as of oct. 2017, PatchUser only implemented for changing user's password
// any attempt to patch something else should trigger an error
func (rest *RESTfacility) PatchUser(user_id string, patch *gjson.Result, notifiers Notifications.Notifiers) error {

	user, err := rest.store.RetrieveUser(user_id)
	if err != nil {
		return err
	}

	if patch.Get("password").Exists() {
		// if found a `password` property in patch, then special case :
		// there should be no other properties to patch
		err = validatePasswordPatch(patch)
		if err != nil {
			return errors.New("[REST PatchUser] invalid password patch : " + err.Error())
		}
		// call the service that change user password
		err = users.ChangeUserPassword(user, patch, rest.store)
		if err != nil {
			return err
		}
		// compose and send a notification email to user
		notif := &Message{
			Body_plain: changePasswordBodyPlain,
			Body_html:  changePasswordBodyRich,
			Subject:    changePasswordSubject,
		}
		go notifiers.SendEmailAdminToUser(user, notif)
		return nil
	} else {
		// hack to ensure that patch is for password only
		// should be replaced by :
		// helpers.ValidatePatchSemantic(user, patch)
		return errors.New("[REST] PatchUser only implemented for changing password (for now)")
	}
	return nil
}

func (rest *RESTfacility) GetUser(user_id string) (user *User, err error) {
	//TODO
	return
}

// validatePasswordPatch checks if patch has only `password` property
func validatePasswordPatch(patch *gjson.Result) error {
	var err error
	current_state := patch.Get("current_state")
	if !current_state.Exists() {
		return errors.New("[Patch] missing 'current_state' property in patch json")
	}
	if !current_state.IsObject() {
		return errors.New("[Patch] 'current_state' property in patch json is not an object")
	}

	keyValidator := func(key, value gjson.Result) bool {
		if key.String() != "current_state" && key.String() != "password" {
			err = errors.New(fmt.Sprintf("[Patch] found invalid key <%s> in the password patch", key.String()))
			return false
		}
		return true
	}
	patch.ForEach(keyValidator)
	if err == nil {
		current_state.ForEach(keyValidator)
	}

	return err
}

// RequestPasswordReset checks if an user could be found with provided payload request,
// if found, it will trigger the password reset procedure that ends by notifying the user via the provided notifiers interface
func (rest *RESTfacility) RequestPasswordReset(payload PasswordResetRequest, notifier Notifications.EmailNotifiers) error {
	var user *User
	var err error
	// 1. check if user exist
	if payload.Username != "" {
		user, err = rest.store.UserByUsername(payload.Username)
		if err != nil || user == nil {
			logrus.Info(err)
			return errors.New("[RESTfacility] user not found")
		}
		if payload.RecoveryMail != "" {
			// check if provided email is consistent for this user
			if payload.RecoveryMail != user.RecoveryEmail {
				return errors.New("[RESTfacility] username and recovery email mismatch")
			}
		}
	} else if payload.RecoveryMail != "" {
		user, err = rest.store.UserByRecoveryEmail(payload.RecoveryMail)
		if err != nil || user == nil {
			logrus.Info(err)
			return errors.New("[RESTfacility] user not found")
		}
		if payload.Username != "" {
			// check if provided username is consistent for this user
			if payload.Username != user.Name {
				return errors.New("[RESTfacility] username and recovery email mismatch")
			}
		}
	} else {
		return errors.New("[RESTfacility] neither username, nor recovery email provided, at least one required")
	}

	// 2. check if a password reset has already been ignited for that user
	reset_session, err := rest.Cache.GetResetPasswordSession(user.UserId.String())
	if reset_session != nil {
		rest.Cache.DeleteResetPasswordSession(user.UserId.String())
		logrus.Infof("[RESTFacility] reset password session deleted for user <%s> [%s]", user.Name, user.UserId.String())
	}

	// 3. generate a reset token and cache it
	token := shortuuid.New()
	reset_session, err = rest.Cache.SetResetPasswordSession(user.UserId.String(), token)
	if err != nil {
		return err
	}

	// 4. send reset link to user's recovery email address.
	go notifier.SendPasswordResetEmail(user, reset_session)
	logrus.Infof("[RESTFacility] reset password session ignited for user <%s> [%s]", user.Name, user.UserId.String())

	return nil
}

func (rest *RESTfacility) ValidatePasswordResetToken(token string) (session *Pass_reset_session, err error) {
	session, err = rest.Cache.GetResetPasswordToken(token)
	if err != nil || session == nil {
		return nil, errors.New("[RESTfacility] token not found")
	}
	if time.Now().After(session.Expires_at) {
		return nil, errors.New("[RESTfacility] token expired")
	}
	return session, nil
}

func (rest *RESTfacility) ResetUserPassword(token, new_password string, notifier Notifications.EmailNotifiers) error {
	session, err := rest.ValidatePasswordResetToken(token)
	if err != nil {
		return err
	}
	user, err := rest.store.RetrieveUser(session.User_id)
	if err != nil {
		return err
	}

	// reset password
	err = users.ResetUserPassword(user, new_password, rest.store)
	if err != nil {
		return err
	}

	logrus.Infof("[RESTFacility] password reset for user <%s> [%s]", user.Name, user.UserId.String())

	// delete reset session cache
	err = rest.Cache.DeleteResetPasswordSession(user.UserId.String())
	if err != nil {
		logrus.WithError(err).Warnf("[RESTfacility] failed to delete reset session cache for user %s", user.UserId.String())
	} else {
		logrus.Infof("[RESTFacility] reset password session deleted for user <%s> [%s]", user.Name, user.UserId.String())
	}

	// send email notification to user's recovery email address
	notif := &Message{
		Body_plain: changePasswordBodyPlain,
		Body_html:  changePasswordBodyRich,
		Subject:    changePasswordSubject,
	}
	go notifier.SendEmailAdminToUser(user, notif)

	return nil
}
