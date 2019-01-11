package users

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/Sirupsen/logrus"
	"golang.org/x/oauth2"
	googleOAuth2 "golang.org/x/oauth2/google"
	"time"
)

const (
	CALLBACK_BASE_URI  = "/api/v2/providers/%s/callback"
	CRED_ACCESS_TOKEN  = "oauth2accesstoken"
	CRED_REFRESH_TOKEN = "oauh2refreshtoken"
	CRED_TOKEN_TYPE    = "tokentype"
	CRED_TOKEN_EXPIRY  = "tokenexpiry"
	CRED_USERNAME      = "username"
)

type Oauth2Interfacer interface {
	GetProviders() map[string]Provider
	GetHostname() string
	GetIdentityStore() backends.IdentityStorageUpdater
}

// ValidateOauth2Credentials wraps methods to check Oauth2 access token validity for different providers.
// If oauth2 access token has expired it's renewed using oauth2 refresh token.
// New access token is embedded in userIdentity, and stored in db if updateStore is set to true.
func ValidateOauth2Credentials(userIdentity *UserIdentity, interfacer Oauth2Interfacer, updateStore bool) CaliopenError {
	switch userIdentity.Infos["provider"] {
	case "gmail":
		gmail, gotProvider := interfacer.GetProviders()["gmail"]
		if !gotProvider {
			return NewCaliopenErr(FailDependencyCaliopenErr, "failed to find gmail provider params in providers map")
		}
		credentialsUpdated, err := getValidGmailAccessToken(userIdentity, gmail, interfacer.GetHostname())
		if err != nil {
			return WrapCaliopenErr(err, WrongCredentialsErr, "failed to get valid gmail access token")
		}
		if credentialsUpdated && updateStore {
			credentials := userIdentity.Credentials
			store := interfacer.GetIdentityStore()
			err := store.UpdateUserIdentity(userIdentity, map[string]interface{}{
				"Credentials": userIdentity.Credentials,
			})
			// re-embed credentials in userIdentity because store.UpdateUserIdentity has removed it from UserIdentity struct
			userIdentity.Credentials = credentials
			if err != nil {
				return WrapCaliopenErr(err, WrongCredentialsErr, "imapLogin failed to update access token in store")
			}
		}
	default:
		return NewCaliopenErrf(FailDependencyCaliopenErr, "unhandled oauth2 provider <%s>", interfacer.GetProviders()[userIdentity.Infos["provider"]])
	}
	return nil
}

/* Google services */

func SetGoogleAuthRequestUrl(provider *Provider, hostname string) (state string, err error) {

	provider.OauthCallbackUri = fmt.Sprintf(CALLBACK_BASE_URI, "gmail")

	config := SetGoogleOauthConfig(*provider, hostname)

	state = randomState()

	provider.OauthRequestUrl = config.AuthCodeURL(state, oauth2.AccessTypeOffline)
	return
}

func SetGoogleOauthConfig(provider Provider, hostname string) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     provider.Infos["client_id"],
		ClientSecret: provider.Infos["client_secret"],
		Endpoint:     googleOAuth2.Endpoint,
		RedirectURL:  hostname + provider.OauthCallbackUri,
		Scopes:       []string{"profile", "email", "https://mail.google.com/"},
	}
}

// GetValidGmailAccessToken checks identity's access token validity.
// If token has expired a new one is retrieved by the mean of refresh token,
// new credentials are embedded in user identity and credentialsUpdated is set to true.
// UserIdentity MUST carry identity's credentials. It's caller responsibility to store new credentials in db.
func getValidGmailAccessToken(uId *UserIdentity, provider Provider, hostname string) (credentialsUpdated bool, err error) {
	if uId.Credentials == nil {
		err = errors.New("[GetValidGmailAccessToken] missing credentials in user identity")
		return
	}

	expiry, err := time.Parse(time.RFC3339, (*uId.Credentials)[CRED_TOKEN_EXPIRY])
	if err != nil {
		logrus.Error(err)
	}
	restoredToken := &oauth2.Token{
		AccessToken:  (*uId.Credentials)[CRED_ACCESS_TOKEN],
		TokenType:    (*uId.Credentials)[CRED_TOKEN_TYPE],
		RefreshToken: (*uId.Credentials)[CRED_REFRESH_TOKEN],
		Expiry:       expiry,
	}
	if restoredToken.Expiry.IsZero() || !restoredToken.Valid() {
		// need a new token
		oauthConfig := SetGoogleOauthConfig(provider, hostname)
		ctx := context.TODO()
		tokenSource := oauthConfig.TokenSource(ctx, restoredToken)
		updatedToken, tokenErr := tokenSource.Token()
		if tokenErr != nil {
			logrus.Errorf("[getValidGmailAccessToken]TokenSource error : %+v", tokenErr)
			err = tokenErr
			return
		}
		logrus.Infof("updated token : %+v", updatedToken) // TODO: REMOVE
		(*uId.Credentials)[CRED_ACCESS_TOKEN] = updatedToken.AccessToken
		(*uId.Credentials)[CRED_REFRESH_TOKEN] = updatedToken.RefreshToken
		(*uId.Credentials)[CRED_TOKEN_EXPIRY] = updatedToken.Expiry.Format(time.RFC3339)
		(*uId.Credentials)[CRED_TOKEN_TYPE] = updatedToken.TokenType
		credentialsUpdated = true
		return
	}
	return
}

// Returns a base64 encoded random 32 byte string.
func randomState() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

/* end of Google services*/
