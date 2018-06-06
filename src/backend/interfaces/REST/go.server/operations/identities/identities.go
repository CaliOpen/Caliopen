/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package identities

import (
	"bytes"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	"github.com/gin-gonic/gin"
	swgErr "github.com/go-openapi/errors"
	"github.com/satori/go.uuid"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
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

// GetRemoteIdentities handles GET …/identities/remotes
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
		json_id, err := id.MarshalFrontEnd()
		if err == nil {
			if first {
				first = false
			} else {
				respBuf.WriteByte(',')
			}
			respBuf.Write(json_id)
		}
	}
	respBuf.WriteString("]}")
	ctx.Data(http.StatusOK, "application/json; charset=utf-8", respBuf.Bytes())

}

// GetRemoteIdentity handles GET …/identities/remotes/:identifier
func GetRemoteIdentity(ctx *gin.Context) {
	userID, err := operations.NormalizeUUIDstring(ctx.GetString("user_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}
	identifier := ctx.Param("identifier")
	if identifier == "" {
		e := swgErr.New(http.StatusUnprocessableEntity, "empty identifier")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	identity, e := caliopen.Facilities.RESTfacility.RetrieveRemoteIdentity(userID, identifier)
	if e != nil {
		returnedErr := new(swgErr.CompositeError)
		if e.Code() == NotFoundCaliopenErr {
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), e, e.Cause())
		} else {
			returnedErr = swgErr.CompositeValidationError(e, e.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
	} else {
		id_json, err := identity.MarshalFrontEnd()
		if err != nil {
			e := swgErr.New(http.StatusFailedDependency, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
		} else {
			ctx.Data(http.StatusOK, "application/json; charset=utf-8", id_json)
		}
	}
}

// NewRemoteIdentity handles POST …/identities/remotes
func NewRemoteIdentity(ctx *gin.Context) {
	// check payload
	user_id := ctx.MustGet("user_id").(string)
	userID, err := operations.NormalizeUUIDstring(user_id)
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	identity := new(RemoteIdentity)
	identity.MarshallNew()
	err = ctx.ShouldBindJSON(identity)
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	// add UserId
	identity.UserId.UnmarshalBinary(uuid.FromStringOrNil(userID).Bytes())
	// reset forbidden property
	identity.LastCheck = time.Time{}

	// call api
	apiErr := caliopen.Facilities.RESTfacility.CreateRemoteIdentity(identity)
	if apiErr != nil {
		returnedErr := new(swgErr.CompositeError)
		switch apiErr.Code() {
		case UnprocessableCaliopenErr:
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusUnprocessableEntity, "api returned unprocessable error"), apiErr, apiErr.Cause())
		case DbCaliopenErr:
			if prevErr, ok := apiErr.Cause().(CaliopenError); ok {
				switch prevErr.Code() {
				case ForbiddenCaliopenErr:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusForbidden, "api returned forbidden error"), apiErr, apiErr.Cause())
				case NotFoundCaliopenErr:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "api failed to retrieve in store"), apiErr, apiErr.Cause())
				default:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "api failed to call store"), apiErr, apiErr.Cause())
				}
			} else {
				returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "api failed to call store"), apiErr, apiErr.Cause())
			}
		default:
			returnedErr = swgErr.CompositeValidationError(apiErr, apiErr.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
	} else {
		ctx.JSON(http.StatusOK, struct {
			Location   string `json:"location"`
			Identifier string `json:"identifier"`
		}{
			http_middleware.RoutePrefix + http_middleware.IdentitiesRoute + "/" + identity.UserId.String() + "/" + identity.Identifier,
			identity.Identifier,
		})
	}
	return
}

// PatchRemoteIdentity handles PATCH …/identities/remotes/:identifier
func PatchRemoteIdentity(ctx *gin.Context) {
	var err error
	userId, err := operations.NormalizeUUIDstring(ctx.MustGet("user_id").(string))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	identifier := ctx.Param("identifier")
	if identifier == "" {
		e := swgErr.New(http.StatusBadRequest, "empty identifier")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	var patch []byte
	patch, err = ioutil.ReadAll(ctx.Request.Body)
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	// call REST facility with payload
	apiErr := caliopen.Facilities.RESTfacility.PatchRemoteIdentity(patch, userId, identifier)
	if apiErr != nil {
		returnedErr := new(swgErr.CompositeError)
		switch apiErr.Code() {
		case UnprocessableCaliopenErr:
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusUnprocessableEntity, "api returned unprocessable error"), apiErr, apiErr.Cause())
		case DbCaliopenErr:
			if prevErr, ok := apiErr.Cause().(CaliopenError); ok {
				switch prevErr.Code() {
				case ForbiddenCaliopenErr:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusForbidden, "api returned forbidden error"), apiErr, apiErr.Cause())
				case NotFoundCaliopenErr:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "api failed to retrieve in store"), apiErr, apiErr.Cause())
				default:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "api failed to call store"), apiErr, apiErr.Cause())
				}
			} else {
				returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "api failed to call store"), apiErr, apiErr.Cause())
			}
		default:
			returnedErr = swgErr.CompositeValidationError(apiErr, apiErr.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
	} else {
		ctx.Status(http.StatusNoContent)
	}
}

// DeleteRemoteIdentity handles DELETE …/identities/remotes/:identifier
func DeleteRemoteIdentity(ctx *gin.Context) {
	var err error
	// check request
	userId, err := operations.NormalizeUUIDstring(ctx.MustGet("user_id").(string))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	identifier := ctx.Param("identifier")
	if identifier == "" {
		e := swgErr.New(http.StatusBadRequest, "empty identifier")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	// call api
	apiErr := caliopen.Facilities.RESTfacility.DeleteRemoteIdentity(userId, identifier)
	if apiErr != nil {
		returnedErr := new(swgErr.CompositeError)
		switch apiErr.Code() {
		case UnprocessableCaliopenErr:
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusUnprocessableEntity, "api returned unprocessable error"), apiErr, apiErr.Cause())
		case DbCaliopenErr:
			if prevErr, ok := apiErr.Cause().(CaliopenError); ok {
				switch prevErr.Code() {
				case ForbiddenCaliopenErr:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusForbidden, "api returned forbidden error"), apiErr, apiErr.Cause())
				case NotFoundCaliopenErr:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "api failed to retrieve in store"), apiErr, apiErr.Cause())
				default:
					returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "api failed to call store"), apiErr, apiErr.Cause())
				}
			} else {
				returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusFailedDependency, "api failed to call store"), apiErr, apiErr.Cause())
			}
		default:
			returnedErr = swgErr.CompositeValidationError(apiErr, apiErr.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
	} else {
		ctx.Status(http.StatusNoContent)
	}
}
