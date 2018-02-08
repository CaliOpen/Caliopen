// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package messages

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
	"time"
)

// POST …/:message_id/attachments
func UploadAttachment(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	shard_id := ctx.MustGet("shard_id").(string)
	user := &UserInfo{User_id: user_id, Shard_id: shard_id}
	msg_id, err := operations.NormalizeUUIDstring(ctx.Param("message_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	file, header, err := ctx.Request.FormFile("attachment")
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	filename := header.Filename
	content_type := header.Header["Content-Type"][0]
	attchmtUrl, err := caliopen.Facilities.RESTfacility.AddAttachment(user, msg_id, filename, content_type, file)
	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	resp := struct {
		Location string
	}{attchmtUrl}
	ctx.JSON(http.StatusOK, resp)
}

// DELETE …/:message_id/attachments/:attachment_index
func DeleteAttachment(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	shard_id := ctx.MustGet("shard_id").(string)
	user := &UserInfo{User_id: user_id, Shard_id: shard_id}
	msg_id, err := operations.NormalizeUUIDstring(ctx.Param("message_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	attch_id, err := strconv.Atoi(ctx.Param("attachment_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	err = caliopen.Facilities.RESTfacility.DeleteAttachment(user, msg_id, attch_id)
	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	ctx.Status(http.StatusOK)
}

// GET …/:message_id/attachments/:attachment_index
// sends attachment as a file to client
func DownloadAttachment(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	msg_id, err := operations.NormalizeUUIDstring(ctx.Param("message_id"))
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	attch_id, err := strconv.Atoi(ctx.Param("attachment_id"))
	if err != nil || msg_id == "" {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	contentType, size, content, err := caliopen.Facilities.RESTfacility.OpenAttachment(user_id, msg_id, attch_id)
	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	// create a ReaderSeeker from the io.Reader returned by OpenAttachment
	attch_bytes := make([]byte, size)
	content.Read(attch_bytes)
	rs := bytes.NewReader(attch_bytes)

	ctx.Header("Content-Type", contentType)
	http.ServeContent(ctx.Writer, ctx.Request, "", time.Time{}, rs)
}
