// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package cache

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"gopkg.in/redis.v5"
)

type (
	RedisBackend struct {
		CacheConfig
		client *redis.Client
	}
)

func InitializeRedisBackend(config CacheConfig) (cache *RedisBackend, err error) {
	cache = new(RedisBackend)
	err = cache.initialize(config)
	return
}

func (cache *RedisBackend) initialize(config CacheConfig) (err error) {
	cache.CacheConfig = config
	client := redis.NewClient(&redis.Options{
		Addr:     config.Host,
		Password: config.Password,
		DB:       config.Db,
	})
	_, err = client.Ping().Result()
	if err != nil {
		return err
	}
	cache.client = client
	return nil
}
