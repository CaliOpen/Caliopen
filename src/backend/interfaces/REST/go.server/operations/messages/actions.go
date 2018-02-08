// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package messages

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	log "github.com/Sirupsen/logrus"
	"github.com/gin-gonic/gin"
	swgErr "github.com/go-openapi/errors"
	"net/http"
)

// json payload on routes …/actions
type REST_order struct {
	Actions []string `json:"actions"`
}

// POST …/:message_id/actions
func Actions(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	shard_id := ctx.MustGet("shard_id").(string)
	user_info := &UserInfo{User_id: user_id, Shard_id: shard_id}
	msg_id, err := operations.NormalizeUUIDstring(ctx.Param("message_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	var actions REST_order
	if err := ctx.BindJSON(&actions); err == nil {
		switch actions.Actions[0] {
		case "send":
			updated_msg, err := caliopen.Facilities.RESTfacility.SendDraft(user_id, msg_id)
			if err != nil {
				e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
				http_middleware.ServeError(ctx.Writer, ctx.Request, e)
				ctx.Abort()
			} else {
				// TODO : find the correct body_type to use
				msg_json, err := updated_msg.MarshalFrontEnd("plain_text")
				if err != nil {
					e := swgErr.New(http.StatusFailedDependency, err.Error())
					http_middleware.ServeError(ctx.Writer, ctx.Request, e)
					ctx.Abort()
				} else {
					ctx.Data(http.StatusOK, "application/json; charset=utf-8", msg_json)
				}
			}
		case "set_read":
			err := caliopen.Facilities.RESTfacility.SetMessageUnread(user_info, msg_id, false)
			if err != nil {
				e := swgErr.New(http.StatusFailedDependency, err.Error())
				http_middleware.ServeError(ctx.Writer, ctx.Request, e)
				ctx.Abort()
			} else {
				ctx.Status(http.StatusNoContent)
			}
		case "set_unread":
			err := caliopen.Facilities.RESTfacility.SetMessageUnread(user_info, msg_id, true)
			if err != nil {
				e := swgErr.New(http.StatusFailedDependency, err.Error())
				http_middleware.ServeError(ctx.Writer, ctx.Request, e)
				ctx.Abort()
			} else {
				ctx.Status(http.StatusNoContent)
			}
		default:
			e := swgErr.New(http.StatusNotImplemented, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
		}
	} else {
		log.Warn(err)
	}
}
