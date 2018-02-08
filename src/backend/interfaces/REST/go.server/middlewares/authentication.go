// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package http_middleware

import (
	"encoding/base64"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func BasicAuthFromCache(cache backends.APICache, realm string) gin.HandlerFunc {
	if realm == "" {
		realm = "Authorization Required"
	}
	realm = "Basic realm=" + strconv.Quote(realm)

	return func(c *gin.Context) {
		// Get provided auth headers
		var user_id, access_token string
		var ok bool

		//Try auth-scheme 'Bearer' then 'Basic'
		if user_id, access_token, ok = BearerAuth(c.Request); !ok {
			if user_id, access_token, ok = c.Request.BasicAuth(); !ok {
				kickUnauthorizedRequest(c, realm)
				return
			}
		}

		// Search user in cache of allowed credentials
		auth, err := cache.GetAuthToken("tokens::" + user_id)
		if err != nil || auth == nil || auth.Access_token != access_token || time.Since(auth.Expires_at) > 0 {
			kickUnauthorizedRequest(c, realm)
			return
		}

		//save user_id and shard_id related to an user session in context for future retrieval
		c.Set("user_id", user_id)
		c.Set("shard_id", auth.Shard_id)
	}
}

func kickUnauthorizedRequest(c *gin.Context, realm string) {
	c.AbortWithStatus(401)
}

func BearerAuth(r *http.Request) (username, password string, ok bool) {
	auth := r.Header.Get("Authorization")
	if auth == "" {
		return
	}
	return parseBearerAuth(auth)
}

func parseBearerAuth(auth string) (username, password string, ok bool) {
	const prefix = "Bearer "
	if !strings.HasPrefix(auth, prefix) {
		return
	}
	c, err := base64.StdEncoding.DecodeString(auth[len(prefix):])
	if err != nil {
		return
	}
	cs := string(c)
	s := strings.IndexByte(cs, ':')
	if s < 0 {
		return
	}
	return cs[:s], cs[s+1:], true
}
