package operations

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server/middlewares"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main"
	swgErr "github.com/go-openapi/errors"
	"github.com/satori/go.uuid"
	"gopkg.in/gin-gonic/gin.v1"
	"net/http"
	"strconv"
)

func SimpleSearch(ctx *gin.Context) {
	user_uuid, _ := uuid.FromString(ctx.MustGet("user_id").(string))
	var user_UUID UUID
	var limit, offset int
	user_UUID.UnmarshalBinary(user_uuid.Bytes())
	query := ctx.Request.URL.Query()
	// simply check if param 'context' is present.
	// empty 'context' is allowed for now because API doesn't handle it.
	if _, ok := query["context"]; !ok {
		e := swgErr.New(http.StatusUnprocessableEntity, "Missing 'context' param in query")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	query.Del("context") // do not take into account of context for now

	if l, ok := query["limit"]; ok {
		limit, _ = strconv.Atoi(l[0])
		query.Del("limit")
	}
	if o, ok := query["offset"]; ok {
		offset, _ = strconv.Atoi(o[0])
		query.Del("offset")
	}
	if len(query) == 0 {
		e := swgErr.New(http.StatusUnprocessableEntity, "Missing terms in query")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	for _, value := range query {
		for _, str := range value {
			if len(str) < 3 {
				e := swgErr.New(http.StatusUnprocessableEntity, "At least one term is less than 3 chars")
				http_middleware.ServeError(ctx.Writer, ctx.Request, e)
				ctx.Abort()
				return
			}
		}
	}

	search := IndexSearch{
		User_id: user_UUID,
		Terms:   map[string][]string(query),
		Limit:   limit,
		Offset:  offset,
	}
	result, err := caliopen.Facilities.RESTfacility.Search(search)
	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	} else {
		ctx.Data(http.StatusOK, "application/json; charset=utf-8", result)

	}
}

func AdvancedSearch(ctx *gin.Context) {
	ctx.AbortWithStatus(http.StatusNotImplemented)
}
