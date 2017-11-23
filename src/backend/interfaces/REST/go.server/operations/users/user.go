// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package users

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/helpers"
	swgErr "github.com/go-openapi/errors"
	"gopkg.in/gin-gonic/gin.v1"
	"io/ioutil"
	"net/http"
)

// PATCH …/users/{user_id}
// as of october 2017, PatchUser is partially implemented :
// it should be only use to change user's password.
func PatchUser(ctx *gin.Context) {
	var err error
	auth_user := ctx.MustGet("user_id").(string)
	user_id, err := operations.NormalizeUUIDstring(ctx.Param("user_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	// for now, an user can only modify himself
	if auth_user != user_id {
		e := swgErr.New(http.StatusUnauthorized, "user can only modify himself")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	body, err := ioutil.ReadAll(ctx.Request.Body)
	patch, err := helpers.ParsePatch(body)
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	err = caliopen.Facilities.RESTfacility.PatchUser(auth_user, patch, caliopen.Facilities.Notifiers)

	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	} else {
		ctx.Status(http.StatusNoContent)
	}

}

// RequestPasswordReset handles an anonymous POST request on /passwords/reset/ with json payload
// it will try to trigger a password reset procedure
func RequestPasswordReset(ctx *gin.Context) {
	var payload PasswordResetRequest
	err := ctx.BindJSON(&payload)
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	if payload.RecoveryMail == "" && payload.Username == "" {
		e := swgErr.New(http.StatusBadRequest, "neither username nor recovery email provided, at least one required")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	err = caliopen.Facilities.RESTfacility.RequestPasswordReset(payload, caliopen.Facilities.Notifiers)

	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	} else {
		ctx.Status(http.StatusNoContent)
	}
	return
}

// ValidatePassResetToken handles a GET on /passwords/reset/:reset_token
// this route does nothing more than responding with a 204 if reset_token is still valid
func ValidatePassResetToken(ctx *gin.Context) {

	token := ctx.Param("reset_token")

	if token == "" {
		e := swgErr.New(http.StatusUnprocessableEntity, "reset token is empty")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	_, err := caliopen.Facilities.RESTfacility.ValidatePasswordResetToken(token)

	if err != nil {
		e := swgErr.New(http.StatusNotFound, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	} else {
		ctx.Status(http.StatusNoContent)
	}
	return
}

// ResetPassword handles POST on /passwords/reset/:reset_token
// payload should be a json with new password
func ResetPassword(ctx *gin.Context) {

	token := ctx.Param("reset_token")

	if token == "" {
		e := swgErr.New(http.StatusBadRequest, "reset token is empty")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	var payload struct {
		Password string `json:"password"`
	}
	err := ctx.BindJSON(&payload)
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, "unable to unmarshal payload : "+err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	err = caliopen.Facilities.RESTfacility.ResetUserPassword(token, payload.Password, caliopen.Facilities.Notifiers)

	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	} else {
		ctx.Status(http.StatusNoContent)
	}
}

// POST …/users/
func Create(ctx *gin.Context) {
	e := swgErr.New(http.StatusNotImplemented, "not implemented")
	http_middleware.ServeError(ctx.Writer, ctx.Request, e)
	ctx.Abort()
	return
}

func Get(ctx *gin.Context) {
	e := swgErr.New(http.StatusNotImplemented, "not implemented")
	http_middleware.ServeError(ctx.Writer, ctx.Request, e)
	ctx.Abort()
	return
}
