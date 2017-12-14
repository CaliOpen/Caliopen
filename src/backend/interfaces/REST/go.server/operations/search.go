package operations

import (
	"errors"
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
	// temporary hack to check if X-Caliopen-IL header is in request, because go-openapi pkg fails to do it.
	// (NB : CanonicalHeaderKey func normalize http headers with uppercase at beginning of words)
	if _, ok := ctx.Request.Header["X-Caliopen-Il"]; !ok {
		e := swgErr.New(http.StatusFailedDependency, "Missing mandatory header 'X-Caliopen-Il'.")
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	user_uuid, _ := uuid.FromString(ctx.MustGet("user_id").(string))
	var user_UUID UUID
	var limit, offset int
	user_UUID.UnmarshalBinary(user_uuid.Bytes())
	query := ctx.Request.URL.Query()

	// check request consistency. (see search API readme in doc folder)
	invalid := false
	reasons := []error{}
	if len(query) < 1 || len(query) > 4242 { // why 4242 ? why not ?
		invalid = true
		reasons = append(reasons, errors.New("invalid query length"))
	}
	term, term_ok := query["term"]
	if !term_ok {
		invalid = true
		reasons = append(reasons, errors.New("'term' param is missing"))
	}
	for _, t := range term {
		if len(t) < 3 {
			invalid = true
			reasons = append(reasons, errors.New("'term' param must length 3 chars at least"))
		}
	}

	doc_type, has_doc_type := query["doctype"]

	if l, ok := query["limit"]; ok {
		if !has_doc_type {
			invalid = true
			reasons = append(reasons, errors.New("'limit' param only allowed if 'doctype' param also provided"))
		} else {
			limit, _ = strconv.Atoi(l[0])
		}
	}
	if o, ok := query["offset"]; ok {
		if !has_doc_type {
			invalid = true
			reasons = append(reasons, errors.New("'offset' param only allowed if 'doctype' param also provided"))
		} else {
			offset, _ = strconv.Atoi(o[0])
		}
	}

	// build the search object
	search := IndexSearch{
		User_id: user_UUID,
		Limit:   limit,
		Offset:  offset,
		ILrange: GetImportanceLevel(ctx),
	}

	if field, ok := query["field"]; ok {
		if len(field) > 1 {
			invalid = true
			reasons = append(reasons, errors.New("at most one 'field' param allowed"))
		} else {
			search.Terms = map[string][]string{field[0]: query["term"]} // take only first field provided for now
		}
	} else {
		search.Terms = map[string][]string{"_all": query["term"]}
	}

	if has_doc_type {
		if len(doc_type) > 1 {
			invalid = true
			reasons = append(reasons, errors.New("at most one 'doctype' param allowed"))
		} else {
			switch doc_type[0] { // take only first doctype provided for now
			case "message":
				search.DocType = MessageIndexType
			case "contact":
				search.DocType = ContactIndexType
			default:
				invalid = true
				reasons = append(reasons, errors.New("'doctype' unknown"))
			}
		}
	}

	if invalid {
		e := swgErr.CompositeValidationError(reasons...)
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
		return
	}

	// trigger the search
	result, err := caliopen.Facilities.RESTfacility.Search(search)

	// handle response
	if err != nil {
		e := swgErr.New(http.StatusFailedDependency, err.Error())
		http_middleware.ServeError(ctx.Writer, ctx.Request, e)
		ctx.Abort()
	} else {
		response, err := result.MarshalFrontEnd()
		if err != nil {
			e := swgErr.New(http.StatusFailedDependency, err.Error())
			http_middleware.ServeError(ctx.Writer, ctx.Request, e)
			ctx.Abort()
		}
		ctx.Data(http.StatusOK, "application/json; charset=utf-8", response)

	}
}

func AdvancedSearch(ctx *gin.Context) {
	ctx.AbortWithStatus(http.StatusNotImplemented)
}
