package tags

import (
	"bytes"
	"encoding/json"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	swgErr "github.com/go-openapi/errors"
	"github.com/pkg/errors"
	"github.com/satori/go.uuid"
	"gopkg.in/gin-gonic/gin.v1"
	"gopkg.in/gin-gonic/gin.v1/binding"
	"net/http"
	"strconv"
)

func RetrieveUserTags(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	tags, err := caliopen.Facilities.RESTfacility.RetrieveUserTags(user_id)
	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	} else {
		var respBuf bytes.Buffer
		respBuf.WriteString("{\"total\": " + strconv.Itoa(len(tags)) + ",")
		respBuf.WriteString(("\"tags\":["))
		first := true
		for _, tag := range tags {
			json_tag, err := json.Marshal(tag)
			if err == nil {
				if first {
					first = false
				} else {
					respBuf.WriteByte(',')
				}
				respBuf.Write(json_tag)
			}
		}
		respBuf.WriteString("]}")
		ctx.Data(http.StatusOK, "application/json; charset=utf-8", respBuf.Bytes())
	}
}

func CreateTag(ctx *gin.Context) {
	var tag Tag
	b := binding.JSON
	if err := b.Bind(ctx.Request, &tag); err == nil {
		user_uuid, _ := uuid.FromString(ctx.MustGet("user_id").(string))
		tag.User_id.UnmarshalBinary(user_uuid.Bytes())
		err := caliopen.Facilities.RESTfacility.CreateTag(&tag)
		if err != nil {
			e := swgErr.New(http.StatusFailedDependency, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
		} else {
			ctx.JSON(http.StatusOK, struct{ Location string }{
				http_middleware.RoutePrefix + http_middleware.TagsRoute + "/" + tag.Tag_id.String(),
			})
		}
	} else {
		err := errors.WithMessage(err, "Unable to json marshal the provided payload.")
		e := swgErr.New(http.StatusBadRequest, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}

}

func RetrieveTag(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	tag_id := ctx.Param("tag_id")
	if user_id != "" && tag_id != "" {
		tag, err := caliopen.Facilities.RESTfacility.RetrieveTag(user_id, tag_id)
		if err != nil {
			e := swgErr.New(http.StatusFailedDependency, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
		} else {
			ctx.JSON(http.StatusOK, tag)
		}
	} else {
		err := errors.New("invalid params")
		e := swgErr.New(http.StatusBadRequest, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}
}

func PatchTag(ctx *gin.Context) {
	patchTag := struct {
		Tag
		Current_state Tag
	}{}
	b := binding.JSON
	if err := b.Bind(ctx.Request, &patchTag); err == nil {

		user_uuid, _ := uuid.FromString(ctx.MustGet("user_id").(string))
		patchTag.User_id.UnmarshalBinary(user_uuid.Bytes())
		patchTag.Current_state.User_id = patchTag.User_id

		tag_uuid, _ := uuid.FromString(ctx.Param("tag_id"))
		patchTag.Tag_id.UnmarshalBinary(tag_uuid.Bytes())
		patchTag.Current_state.Tag_id = patchTag.Tag_id

		current_tag, err := caliopen.Facilities.RESTfacility.RetrieveTag(patchTag.User_id.String(), patchTag.Tag_id.String())
		if err != nil {
			e := swgErr.New(http.StatusFailedDependency, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
		} else {
			if current_tag.Name != patchTag.Current_state.Name {
				err := errors.New("patch's current_state not consistent with db.")
				e := swgErr.New(http.StatusConflict, err.Error())
				http_middleware.ServeError(ctx.Writer, ctx.Request, e)
				ctx.Abort()
			} else {
				new_tag := Tag{
					Date_insert:      current_tag.Date_insert,
					Importance_level: current_tag.Importance_level,
					Name:             patchTag.Name,
					Tag_id:           current_tag.Tag_id,
					Type:             current_tag.Type,
					User_id:          current_tag.User_id,
				}
				err := caliopen.Facilities.RESTfacility.UpdateTag(&new_tag)
				if err != nil {
					e := swgErr.New(http.StatusFailedDependency, err.Error())
					http_middleware.ServeError(ctx.Writer, ctx.Request, e)
					ctx.Abort()
				} else {
					ctx.Status(http.StatusNoContent)
				}
			}
		}
	} else {
		err = errors.WithMessage(err, "Unable to json marshal the provided payload.")
		e := swgErr.New(http.StatusBadRequest, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}
}

func DeleteTag(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	tag_id := ctx.Param("tag_id")
	if user_id != "" && tag_id != "" {
		err := caliopen.Facilities.RESTfacility.DeleteTag(user_id, tag_id)
		if err != nil {
			e := swgErr.New(http.StatusFailedDependency, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
		} else {
			ctx.Status(http.StatusNoContent)
		}
	} else {
		err := errors.New("invalid params")
		e := swgErr.New(http.StatusBadRequest, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}
}
