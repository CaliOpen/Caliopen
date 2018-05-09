// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package users

import (
	"bytes"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	"github.com/gin-gonic/gin"
	swgErr "github.com/go-openapi/errors"
	"net/http"
	"strconv"
)

//GET …/identities/locals/{identity_id}
func GetLocalIdentity(ctx *gin.Context) {
	e := swgErr.New(http.StatusNotImplemented, "not implemented")
	http_middleware.ServeError(ctx.Writer, ctx.Request, e)
	ctx.Abort()
}

//GET …/identities/locals
func GetLocalsIdentities(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	identities, err := caliopen.Facilities.RESTfacility.RetrieveLocalsIdentities(user_id)
	if err != nil {
		e := swgErr.New(http.StatusInternalServerError, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	ret := struct {
		Total            int             `json:"total"`
		LocalsIdentities []LocalIdentity `json:"local_identities"`
	}{len(identities), identities}
	ctx.JSON(http.StatusOK, ret)
}

// GetRemoteIdentities handle GET …/identities/remotes
func GetRemoteIdentities(ctx *gin.Context) {

	userID, err := operations.NormalizeUUIDstring(ctx.GetString("user_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}

	list, e := caliopen.Facilities.RESTfacility.RetrieveRemoteIdentities(userID)
	if e != nil {
		returnedErr := new(swgErr.CompositeError)
		if e.Code() == DbCaliopenErr && e.Cause().Error() == "ids not found" {
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), e, e.Cause())
		} else {
			returnedErr = swgErr.CompositeValidationError(e, e.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
		return
	}
	var respBuf bytes.Buffer
	respBuf.WriteString("{\"total\": " + strconv.Itoa(len(list)) + ",")
	respBuf.WriteString("\"remote_identities\":[")
	first := true
	for _, id := range list {
		json_contact, err := id.MarshalFrontEnd()
		if err == nil {
			if first {
				first = false
			} else {
				respBuf.WriteByte(',')
			}
			respBuf.Write(json_contact)
		}
	}
	respBuf.WriteString("]}")
	ctx.Data(http.StatusOK, "application/json; charset=utf-8", respBuf.Bytes())

}

// GetRemoteIdentity handle GET …/identities/remotes/:identifier
func GetRemoteIdentity(ctx *gin.Context) {
	e := swgErr.New(http.StatusNotImplemented, "not implemented")
	http_middleware.ServeError(ctx.Writer, ctx.Request, e)
	ctx.Abort()
}

// NewRemoteIdentity handle POST …/identities/remotes
func NewRemoteIdentity(ctx *gin.Context) {
	e := swgErr.New(http.StatusNotImplemented, "not implemented")
	http_middleware.ServeError(ctx.Writer, ctx.Request, e)
	ctx.Abort()
}

// PatchRemoteIdentity handle PATCH …/identities/remotes/:identifier
func PatchRemoteIdentity(ctx *gin.Context) {
	e := swgErr.New(http.StatusNotImplemented, "not implemented")
	http_middleware.ServeError(ctx.Writer, ctx.Request, e)
	ctx.Abort()
}

// DeleteRemoteIdentity handle DELETE …/identities/remotes/:identifier
func DeleteRemoteIdentity(ctx *gin.Context) {
	e := swgErr.New(http.StatusNotImplemented, "not implemented")
	http_middleware.ServeError(ctx.Writer, ctx.Request, e)
	ctx.Abort()
}
