package cache

import (
	"testing"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

var R *RedisBackend

func TestInitializeRedisBackend(t *testing.T) {
	conf := CacheConfig{
		Host:     "redis.dev.caliopen.org:6379",
		Password: "",
		Db:       0,
	}
	var err error
	R, err = InitializeRedisBackend(conf)
	if err != nil {
		t.Fatal(err)
	}
}

func TestRedisBackend_SetResetPasswordSession(t *testing.T) {
	session, err := R.SetResetPasswordSession("user_id", "token_str")
	if err != nil {
		t.Error(err)
	}
	t.Logf("%+v", session)
}

func TestRedisBackend_GetResetPasswordSession(t *testing.T) {
	session, err := R.GetResetPasswordSession("user_id")
	if err != nil {
		t.Error(err)
	}
	t.Logf("%+v", session)
}

func TestRedisBackend_GetResetPasswordToken(t *testing.T) {
	by_token, err := R.GetResetPasswordToken("token_str")
	if err != nil {
		t.Error(err)
	}
	t.Logf("%+v", by_token)
}

func TestRedisBackend_DeleteResetPasswordSession(t *testing.T) {
	err := R.DeleteResetPasswordSession("user_id")
	if err != nil {
		t.Error(err)
	}

	// manually check if there is no tokens anymore in cache for the session
	str, err := R.client.Get(sessionPrefix + "user_id").Result()
	if str != "" || err == nil {
		t.Errorf("value found for %s", sessionPrefix+"user_id")
	}
	str, err = R.client.Get(resetTokenPrefix + "token_str").Result()
	if str != "" || err == nil {
		t.Errorf("value found for %s", sessionPrefix+"user_id")
	}
}
