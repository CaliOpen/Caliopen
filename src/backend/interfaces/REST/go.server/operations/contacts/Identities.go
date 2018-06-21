// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package contacts

import (
	"github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	"github.com/gin-gonic/gin"
	swgErr "github.com/go-openapi/errors"
	"net/http"
)

//GET …/contacts/{contact_id}/identities
func GetIdentities(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	contact_id, err := operations.NormalizeUUIDstring(ctx.Param("contactID"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	identities, err := caliopen.Facilities.RESTfacility.RetrieveContactIdentities(user_id, contact_id)
	if err != nil {
		e := swgErr.New(http.StatusInternalServerError, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	ret := struct {
		Total             int                       `json:"total"`
		ContactIdentities []objects.ContactIdentity `json:"contact_identities"`
	}{len(identities), identities}
	ctx.JSON(http.StatusOK, ret)
}
