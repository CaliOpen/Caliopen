package tags

import (
	"bytes"
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/operations"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	swgErr "github.com/go-openapi/errors"
	"github.com/satori/go.uuid"
	"github.com/tidwall/gjson"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
)

// RetrieveUserTags fetches all tags tied to an user, system tags as well as custom tags.
func RetrieveUserTags(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	tags, err := caliopen.Facilities.RESTfacility.RetrieveUserTags(user_id)
	if err != nil {
		returnedErr := new(swgErr.CompositeError)
		if err.Code() == DbCaliopenErr && err.Cause().Error() == "tags not found" {
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), err, err.Cause())
		} else {
			returnedErr = swgErr.CompositeValidationError(err, err.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
	} else {
		var respBuf bytes.Buffer
		respBuf.WriteString("{\"total\": " + strconv.Itoa(len(tags)) + ",")
		respBuf.WriteString(("\"tags\":["))
		first := true
		for _, tag := range tags {
			json_tag, err := tag.MarshalFrontEnd()
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
		if tag.Label == "" || strings.Replace(tag.Label, " ", "", -1) == "" {
			err := errors.New("tag's name is empty")
			e := swgErr.New(http.StatusBadRequest, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
			return
		}
		tag.Label = strings.TrimSpace(tag.Label)
		err := caliopen.Facilities.RESTfacility.CreateTag(&tag)
		if err != nil {
			returnedErr := new(swgErr.CompositeError)
			if err.Code() == DbCaliopenErr && err.Cause().Error() == "not found" {
				returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), err, err.Cause())
			} else {
				returnedErr = swgErr.CompositeValidationError(err, err.Cause())
			}
			http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
			ctx.Abort()
		} else {
			ctx.JSON(http.StatusOK, struct{ Location string }{
				http_middleware.RoutePrefix + http_middleware.TagsRoute + "/" + tag.Name,
			})
		}
	} else {
		e := swgErr.New(http.StatusBadRequest, fmt.Sprintf("Unable to json marshal the provided payload : %s", err))
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}

}

// RetrieveTag fetches a tag with tag_name & user_id
func RetrieveTag(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	tag_name := ctx.Param("tag_name")
	if tag_name == "" {
		e := swgErr.New(http.StatusUnprocessableEntity, "missing tag name")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	if user_id != "" {
		tag, err := caliopen.Facilities.RESTfacility.RetrieveTag(user_id, tag_name)
		if err != nil {
			returnedErr := new(swgErr.CompositeError)
			if err.Code() == DbCaliopenErr && err.Cause().Error() == "tag not found" {
				returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), err, err.Cause())
			} else {
				returnedErr = swgErr.CompositeValidationError(err, err.Cause())
			}
			http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
			ctx.Abort()
		} else {
			tag_json, err := tag.MarshalFrontEnd()
			if err != nil {
				e := swgErr.New(http.StatusFailedDependency, err.Error())
				http_middleware.ServeError(ctx.Writer, ctx.Request, e)
				ctx.Abort()
			} else {
				ctx.Data(http.StatusOK, "application/json; charset=utf-8", tag_json)
			}
		}
	} else {
		err := errors.New("invalid params")
		e := swgErr.New(http.StatusBadRequest, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	}
}

func PatchTag(ctx *gin.Context) {
	var err error
	var user_id string
	var tag_name string

	if id, ok := ctx.Get("user_id"); !ok {
		e := swgErr.New(http.StatusUnprocessableEntity, "user_id is missing")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	} else {
		if user_id, err = operations.NormalizeUUIDstring(id.(string)); err != nil {
			e := swgErr.New(http.StatusUnprocessableEntity, "user_id is invalid")
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
			return
		}
	}

	tag_name = ctx.Param("tag_name")
	if tag_name == "" {
		e := swgErr.New(http.StatusUnprocessableEntity, "tag_name is missing")
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

	e := caliopen.Facilities.RESTfacility.PatchTag(patch, user_id, tag_name)
	if e != nil {
		returnedErr := new(swgErr.CompositeError)
		if e.Code() == DbCaliopenErr && e.Cause().Error() == "tag not found" {
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), e, e.Cause())
		} else {
			returnedErr = swgErr.CompositeValidationError(e, e.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
		return
	} else {
		ctx.Status(http.StatusNoContent)
	}
}

func DeleteTag(ctx *gin.Context) {
	user_id := ctx.MustGet("user_id").(string)
	tag_name := ctx.Param("tag_name")
	if tag_name == "" {
		e := swgErr.New(http.StatusUnprocessableEntity, "tag_name is missing")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	if user_id != "" {
		err := caliopen.Facilities.RESTfacility.DeleteTag(user_id, tag_name)
		if err != nil {
			returnedErr := new(swgErr.CompositeError)
			if err.Code() == DbCaliopenErr && err.Cause().Error() == "tag not found" {
				returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), err, err.Cause())
			} else {
				returnedErr = swgErr.CompositeValidationError(err, err.Cause())
			}
			http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
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
	// TODO : remove tag refs. nested in resources
}

// PatchResourceWithTag apply the payload (a PATCH tag json) to a resource to update its tags
func PatchResourceWithTags(ctx *gin.Context) {
	var err error
	var userID string
	var resourceID string
	var patch []byte
	var resourceType string

	if id, ok := ctx.Get("user_id"); !ok {
		e := swgErr.New(http.StatusBadRequest, "user_id is missing")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	} else {
		if userID, err = operations.NormalizeUUIDstring(id.(string)); err != nil {
			e := swgErr.New(http.StatusUnprocessableEntity, "user_id is invalid")
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
			return
		}
	}
	shard_id, ok := ctx.Get("shard_id")
	if !ok {
		e := swgErr.New(http.StatusBadRequest, "shard_id is missing in context")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	// parse payload and ensure it is a patch for tags property only
	patch, err = ioutil.ReadAll(ctx.Request.Body)
	if err != nil {
		e := swgErr.New(http.StatusUnprocessableEntity, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	if !gjson.Valid(string(patch)) {
		e := swgErr.New(http.StatusUnprocessableEntity, "invalid json")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}
	p := gjson.ParseBytes(patch)
	p.ForEach(func(key, value gjson.Result) bool {
		if key.Str != "tags" && key.Str != "current_state" {
			err = swgErr.New(http.StatusBadRequest, fmt.Sprintf("invalid property <%s> within json", key.Str))
			return false
		} else if key.Str == "current_state" {
			value.ForEach(func(k, v gjson.Result) bool {
				if k.Str != "tags" {
					err = swgErr.New(http.StatusBadRequest, fmt.Sprintf("invalid property <%s> within json", k.Str))
					return false
				}
				return true
			})
		}
		return true
	})
	if err != nil {
		http_middleware.ServeError(ctx.Writer, ctx.Request, err)
		ctx.Abort()
		return
	}

	// call UpdateResourceWithPatch API with correct resourceType depending on provided param
	param := ctx.Params[0]
	switch param.Key {
	case "contactID":
		resourceType = ContactType
	case "message_id":
		resourceType = MessageType
	default:
		err = swgErr.New(http.StatusBadRequest, "missing resource param")
		if err != nil {
			http_middleware.ServeError(ctx.Writer, ctx.Request, err)
			ctx.Abort()
			return
		}
	}
	if resourceID, err = operations.NormalizeUUIDstring(param.Value); err != nil {
		err = swgErr.New(http.StatusBadRequest, "resource_id is invalid")
	}
	if err != nil {
		http_middleware.ServeError(ctx.Writer, ctx.Request, err)
		ctx.Abort()
		return
	}

	user_info := &UserInfo{User_id: userID, Shard_id: shard_id.(string)}
	e := caliopen.Facilities.RESTfacility.UpdateResourceTags(user_info, resourceID, resourceType, patch)
	if e != nil {
		returnedErr := new(swgErr.CompositeError)
		if e.Code() == DbCaliopenErr && e.Cause().Error() == "not found" {
			returnedErr = swgErr.CompositeValidationError(swgErr.New(http.StatusNotFound, "db returned not found"), e, e.Cause())
		} else {
			returnedErr = swgErr.CompositeValidationError(e, e.Cause())
		}
		http_middleware.ServeError(ctx.Writer, ctx.Request, returnedErr)
		ctx.Abort()
		return
	}
	ctx.Status(http.StatusNoContent)
}
