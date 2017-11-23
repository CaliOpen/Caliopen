// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package cache

import (
	"encoding/json"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

// GetAuthToken retrieves auth values stored for the given key
// values are casted into an Auth_cache struct
// key is in the form of "tokens::user_id"
func (cache *RedisBackend) GetAuthToken(key string) (value *Auth_cache, err error) {
	value = &Auth_cache{}
	cache_str, err := cache.client.Get(key).Result()
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal([]byte(cache_str), value)
	if err != nil {
		return nil, err
	}
	return
}
