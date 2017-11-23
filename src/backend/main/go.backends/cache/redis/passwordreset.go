// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package cache

import (
	"encoding/json"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"time"
)

const (
	sessionPrefix    = "resetsession::"
	resetTokenPrefix = "resettoken::"
	resetPasswordTTL = 8 // ttl in hours
)

// GetResetPasswordSession returns reset password session values stored for the user_id, if any
// Returns a nil 'session' if key is not found
func (cache *RedisBackend) GetResetPasswordSession(user_id string) (session *Pass_reset_session, err error) {
	key := sessionPrefix + user_id
	session_str, err := cache.client.Get(key).Bytes()
	if err != nil {
		return nil, err
	}
	session = &Pass_reset_session{}
	err = json.Unmarshal(session_str, session)
	if err != nil {
		return nil, err
	}
	return
}

// SetResetPasswordSession stores key,value for given user_id and reset_token.
// The key will be in the form of "resetsession::user_id".
// Func will also call setResetPasswordToken() to add a secondary key in the form "resettoken::reset_token" pointing to the same value
// Func returns a pointer to the Pass_reset_session object that represents values stored in the cache.
// user_id and reset_token strings must be well-formatted, they will not be checked.
func (cache *RedisBackend) SetResetPasswordSession(user_id, reset_token string) (session *Pass_reset_session, err error) {
	ttl := resetPasswordTTL * time.Hour
	expiration := time.Now().Add(ttl)
	session = &Pass_reset_session{
		Reset_token: reset_token,
		Expires_at:  expiration,
		Expires_in:  int(ttl / time.Second),
		User_id:     user_id,
	}
	session_str, err := json.Marshal(session)
	if err != nil {
		return nil, err
	}

	_, err = cache.client.Set(sessionPrefix+user_id, session_str, ttl).Result()
	if err != nil {
		return nil, err
	}

	err = cache.setResetPasswordToken(reset_token, session_str, ttl)
	if err != nil {
		return nil, err
	}
	return session, nil
}

// SetResetPasswordToken stores key,value for given reset_token.
// It is called by SetResetPasswordSession to add a secondary key pointing to the same underlying value.
// The key is in the form "resettoken::reset_token"
func (cache *RedisBackend) setResetPasswordToken(token string, session []byte, ttl time.Duration) error {
	_, err := cache.client.Set(resetTokenPrefix+token, session, ttl).Result()
	return err
}

// GetResetPasswordToken returns values found for the given reset_token key
func (cache *RedisBackend) GetResetPasswordToken(token string) (session *Pass_reset_session, err error) {
	key := resetTokenPrefix + token
	session_str, err := cache.client.Get(key).Bytes()
	if err != nil {
		return nil, err
	}
	session = &Pass_reset_session{}
	err = json.Unmarshal(session_str, session)
	if err != nil {
		return nil, err
	}
	return
}

// DeleteResetPasswordSession will delete two keys in a row :
// the resetsession key and the resettoken key
func (cache *RedisBackend) DeleteResetPasswordSession(user_id string) error {

	session, err := cache.GetResetPasswordSession(user_id)
	if err != nil {
		return err
	}

	key := sessionPrefix + user_id
	_, err = cache.client.Del(key).Result()
	if err != nil {
		return err
	}

	key = resetTokenPrefix + session.Reset_token
	_, err = cache.client.Del(key).Result()
	if err != nil {
		return err
	}
	return nil
}
