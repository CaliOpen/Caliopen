// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package http_middleware

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/sha256"
	"encoding/asn1"
	"encoding/base64"
	"errors"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	log "github.com/Sirupsen/logrus"
	"github.com/gin-gonic/gin"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type ecdsaSignature struct {
	R, S *big.Int
}

// getSignedQuery, build the HTTP query that has been signed
func getSignedQuery(c *gin.Context) string {
	query := c.Request.Method + c.Request.URL.String()
	return query
}

// verifySignature, check for validity of device ecdsa signature
func verifySignature(signature, query, curve string, x, y big.Int) (bool, error) {
	sign := &ecdsaSignature{}
	decoded, err := base64.StdEncoding.DecodeString(signature)
	if err != nil {
		return false, err
	}
	_, err = asn1.Unmarshal([]byte(decoded), sign)
	if err != nil {
		return false, err
	}
	var hashed []byte
	var key ecdsa.PublicKey
	switch curve {
	case "P-256":
		// Create hash of content
		hash := sha256.New()
		hash.Write([]byte(query))
		hashed = hash.Sum(nil)
		crv := elliptic.P256()
		key = ecdsa.PublicKey{Curve: crv, X: &x, Y: &y}
	default:
		return false, errors.New("Invalid device curve")
	}

	valid := ecdsa.Verify(&key, hashed, sign.R, sign.S)
	return valid, nil
}

func BasicAuthFromCache(cache backends.APICache, realm string) gin.HandlerFunc {
	if realm == "" {
		realm = "Authorization Required"
	}
	realm = "Basic realm=" + strconv.Quote(realm)

	return func(c *gin.Context) {
		// Get provided auth headers
		var user_id, access_token string
		var ok bool
		var cache_key string

		//Try auth-scheme 'Bearer' then 'Basic'
		if user_id, access_token, ok = BearerAuth(c.Request); !ok {
			if user_id, access_token, ok = c.Request.BasicAuth(); !ok {
				kickUnauthorizedRequest(c, realm)
				return
			}
		}

		if device_id, ok := c.Request.Header["X-Caliopen-Device-ID"]; ok {
			cache_key = user_id + "-" + device_id[0]
		} else {
			cache_key = user_id
		}

		// Search user in cache of allowed credentials
		auth, err := cache.GetAuthToken("tokens::" + cache_key)
		if err != nil || auth == nil || auth.Access_token != access_token || time.Since(auth.Expires_at) > 0 {
			kickUnauthorizedRequest(c, realm)
			return
		}

		if device_sign, ok := c.Request.Header["X-Caliopen-Device-Signature"]; ok {
			query := getSignedQuery(c)
			valid, err := verifySignature(device_sign[0], query, auth.Curve, auth.X, auth.Y)
			if err != nil {
				log.Println("Error during signature verification: ", err)
				// kickUnauthorizedRequest(c, "Authorization error")
			}
			if valid == false {
				log.Println("Verification of signature failed")
				// kickUnauthorizedRequest(c, "Authorization failed")
			} else {
				log.Println("Verification of signature OK")
			}
		} else {
			log.Println("No signature found for device ")
		}

		//save user_id in context for future retreival
		c.Set("user_id", user_id)
		c.Set("access_token", "tokens::"+cache_key)
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
