// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package users

import (
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/nbutton23/zxcvbn-go"
	"github.com/tidwall/gjson"
	"golang.org/x/crypto/bcrypt"
	"strconv"
)

const (
	defaultBcryptCost   = 12                  // 12 is the default cost of python's bcrypt lib
	passwordStrengthkey = "password_strength" // key in privacy_features map
)

func ChangeUserPassword(user *User, patch *gjson.Result, store backends.UserStorage) error {
	// verify that current_password in patch is the good one
	current_pwd := patch.Get("current_state.password").Str
	err := bcrypt.CompareHashAndPassword(user.Password, []byte(current_pwd))
	if err != nil {
		return errors.New("old password is incorrect")
	}

	new_password := patch.Get("password").Str

	return ResetUserPassword(user, new_password, store)
}

func ResetUserPassword(user *User, new_password string, store backends.UserStorage) error {
	//compute new password strength
	user_infos := []string{user.Name, user.GivenName, user.FamilyName, user.RecoveryEmail}
	user_infos = append(user_infos, user.LocalIdentities...)
	scoring := zxcvbn.PasswordStrength(new_password, user_infos)
	(*user.PrivacyFeatures)[passwordStrengthkey] = strconv.FormatInt(int64(scoring.Score), 10)

	// hash new password and store it
	hashpass, err := bcrypt.GenerateFromPassword([]byte(new_password), defaultBcryptCost)
	(*user).Password = hashpass
	err = store.UpdateUserPasswordHash(user)
	if err != nil {
		return errors.New("[ChangeUserPassword] failed to store updated user : " + err.Error())
	}
	return nil
}
