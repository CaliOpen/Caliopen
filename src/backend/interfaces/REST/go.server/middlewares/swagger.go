// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package http_middleware

import (
	"bytes"
	"encoding/json"
	"errors"
	log "github.com/Sirupsen/logrus"
	"github.com/go-openapi/analysis"
	swgErr "github.com/go-openapi/errors"
	"github.com/go-openapi/loads"
	"github.com/go-openapi/runtime"
	"github.com/go-openapi/runtime/middleware"
	"github.com/go-openapi/runtime/middleware/untyped"
	"github.com/go-openapi/spec"
	"github.com/go-openapi/strfmt"
	"gopkg.in/gin-gonic/gin.v1"
	"io"
	"io/ioutil"
	"net/http"
	"strings"
	"sync"
)

var (
	swaggerSpec    *loads.Document
	swaggerAPI     *routableUntypedAPI
	swaggerContext *middleware.Context
)

const (
	noWritten     = -1
	defaultStatus = 200
)

type routableUntypedAPI struct {
	api             *untyped.API
	hlock           *sync.Mutex
	handlers        map[string]map[string]http.Handler
	defaultConsumes string
	defaultProduces string
}

type jsonError struct {
	Code    int32  `json:"code"`
	Message string `json:"message"`
	Name    string `json:"name"`
}

type jsonErrors []jsonError

func InitSwaggerMiddleware(swaggerFile string) (err error) {
	log.Infoln("Loading swagger specifications…")
	swaggerSpec, err = loads.JSONSpec(swaggerFile)
	if err != nil {
		return err
	}
	swagAPI := untyped.NewAPI(swaggerSpec)
	swagAPI.WithJSONDefaults()
	swagAPI.RegisterConsumer("multipart/form-data", runtime.TextConsumer())
	//TODO: write our consumers to be less tighted to open-api
	//swagAPI.ServeError = ServeError

	swagCtx := middleware.NewContext(swaggerSpec, swagAPI, nil)
	if swagCtx == nil {
		log.Warn("no swagContext")
	}

	swaggerAPI = newRoutableUntypedAPI(swaggerSpec, swagAPI, swagCtx)

	swagRouter := middleware.DefaultRouter(swaggerSpec, swaggerAPI)
	if swagRouter == nil {
		log.Warn("no swagRouter")
	}
	swaggerContext = middleware.NewRoutableContext(swaggerSpec, swaggerAPI, swagRouter)
	if swaggerContext == nil {
		log.Warn("no swagContext")
	}

	middleware.NewRouter(swaggerContext, nil) //workaround to set the router within swaggerContext

	return
}

// checks that inputs and/or outputs conform to the swagger specs for the route
// this middleware should be registred as the first middleware to ensure that it checks
// requests before next handlers
func SwaggerValidator() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		SwaggerInboundValidation(ctx)
		ctx.Next()
		//SwaggerOutboundValidation(ctx)
	}
}

func SwaggerInboundValidation(ctx *gin.Context) {
	// make a copy of request to be able to drain body twice :
	// one for swagger validation, other to ctx.next handlers
	body1, body2, err := drainBody(ctx.Request.Body)
	req_copy := new(http.Request)
	*req_copy = *ctx.Request
	ctx.Request.Body = body1
	req_copy.Body = body2
	if err != nil {
		ctx.Abort()
		return
	}

	route, ok := swaggerContext.RouteInfo(ctx.Request)
	if route != nil && ok {
		_, err := swaggerContext.BindAndValidate(req_copy, route)
		if err != nil {
			ServeError(ctx.Writer, ctx.Request, err)
			ctx.Abort()
			return
		}
	} else {
		ServeError(ctx.Writer, ctx.Request, errors.New("Route <"+ctx.Request.Method+" "+ctx.Request.RequestURI+"> not found in swagger specs."))
		ctx.Abort()
		return
	}
	ctx.Set("swgCtx", swaggerContext)
}

func newRoutableUntypedAPI(spec *loads.Document, api *untyped.API, context *middleware.Context) *routableUntypedAPI {
	var handlers map[string]map[string]http.Handler
	if spec == nil || api == nil {
		return nil
	}
	analyzer := analysis.New(spec.Spec())
	for method, hls := range analyzer.Operations() {
		um := strings.ToUpper(method)
		for path, op := range hls {
			schemes := analyzer.SecurityDefinitionsFor(op)

			if handlers == nil {
				handlers = make(map[string]map[string]http.Handler)
			}
			if b, ok := handlers[um]; !ok || b == nil {
				handlers[um] = make(map[string]http.Handler)
			}
			var handler http.Handler //fake handler as we won't use it

			if len(schemes) > 0 {
				handler = newSecureAPI(context, nil)
			}
			handlers[um][path] = handler
		}
	}

	return &routableUntypedAPI{
		api:             api,
		hlock:           new(sync.Mutex),
		handlers:        handlers,
		defaultProduces: api.DefaultProduces,
		defaultConsumes: api.DefaultConsumes,
	}
}

// ServeError the error handler interface implementation
// returns an error json as defined within swagger.json, if any
func ServeError(rw gin.ResponseWriter, r *http.Request, err error) {
	rw.Header().Set("Content-Type", "application/json")
	switch e := err.(type) {
	case *swgErr.CompositeError:
		er := flattenComposite(e)
		rw.WriteHeader(asHTTPCode(int(er.Code()))) //returns the first error code only
		if r == nil || r.Method != "HEAD" {
			rw.Write(errorAsJSON(er))
		}
	case *swgErr.MethodNotAllowedError:
		rw.Header().Add("Allow", strings.Join(err.(*swgErr.MethodNotAllowedError).Allowed, ","))
		rw.WriteHeader(asHTTPCode(int(e.Code())))
		if r == nil || r.Method != "HEAD" {
			rw.Write(errorAsJSON(e))
		}
	case swgErr.Error:
		if e == nil {
			rw.WriteHeader(http.StatusInternalServerError)
			rw.Write(errorAsJSON(swgErr.New(http.StatusInternalServerError, "Unknown error")))
			return
		}
		rw.WriteHeader(asHTTPCode(int(e.Code())))
		if r == nil || r.Method != "HEAD" {
			rw.Write(errorAsJSON(e))
		}
	default:
		rw.WriteHeader(http.StatusInternalServerError)
		if r == nil || r.Method != "HEAD" {
			rw.Write(errorAsJSON(swgErr.New(http.StatusInternalServerError, err.Error())))
		}
	}
	rw.Flush()
	conn, _, _ := rw.Hijack()
	conn.Close()
}

func errorAsJSON(err swgErr.Error) []byte {
	errors := struct {
		Errors jsonErrors `json:"errors"`
	}{}
	switch er := err.(type) {
	case *swgErr.CompositeError:
		for _, e := range er.Errors {
			errors.Errors = append(errors.Errors, jsonError{err.Code(), e.Error(), ""})
		}
		b, _ := json.Marshal(errors)
		return b
	default:
		errors.Errors = append(errors.Errors, jsonError{err.Code(), err.Error(), ""})
		b, _ := json.Marshal(errors)
		return b
	}
}

func flattenComposite(errs *swgErr.CompositeError) *swgErr.CompositeError {
	var res []error
	for _, er := range errs.Errors {
		switch e := er.(type) {
		case *swgErr.CompositeError:
			if len(e.Errors) > 0 {
				flat := flattenComposite(e)
				if len(flat.Errors) > 0 {
					res = append(res, flat.Errors...)
				}
			}
		default:
			if e != nil {
				res = append(res, e)
			}
		}
	}
	return swgErr.CompositeValidationError(res...)
}

func asHTTPCode(input int) int {
	if input >= 600 {
		return 422
	}
	return input
}

// drainBody reads all of b to memory and then returns two equivalent
// ReadClosers yielding the same bytes.
//
// It returns an error if the initial slurp of all bytes fails. It does not attempt
// to make the returned ReadClosers have identical error-matching behavior.
func drainBody(b io.ReadCloser) (r1, r2 io.ReadCloser, err error) {
	if b == http.NoBody {
		// No copying needed. Preserve the magic sentinel meaning of NoBody.
		return http.NoBody, http.NoBody, nil
	}
	var buf bytes.Buffer
	if _, err = buf.ReadFrom(b); err != nil {
		return nil, b, err
	}
	if err = b.Close(); err != nil {
		return nil, b, err
	}
	return ioutil.NopCloser(&buf), ioutil.NopCloser(bytes.NewReader(buf.Bytes())), nil
}

// Func copied from go-openapi
func newSecureAPI(ctx *middleware.Context, next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		route, _ := ctx.RouteInfo(r)
		if route != nil && len(route.Authenticators) == 0 {
			next.ServeHTTP(rw, r)
			return
		}

		if _, err := ctx.Authorize(r, route); err != nil {
			ctx.Respond(rw, r, route.Produces, route, err)
			return
		}

		next.ServeHTTP(rw, r)
	})
}

// Funcs below are copied from openapi sources to facilitate the swagger validation.
// They allow us to satisfy the openapi "RoutableAPI" interface.
// Our current implementation do not call them directly at anytime.
// They should be removed in future.
func (r *routableUntypedAPI) HandlerFor(method, path string) (http.Handler, bool) {
	r.hlock.Lock()
	paths, ok := r.handlers[strings.ToUpper(method)]
	if !ok {
		r.hlock.Unlock()
		return nil, false
	}
	handler, ok := paths[path]
	r.hlock.Unlock()
	return handler, ok
}
func (r *routableUntypedAPI) ServeErrorFor(operationID string) func(http.ResponseWriter, *http.Request, error) {
	return r.api.ServeError
}
func (r *routableUntypedAPI) ConsumersFor(mediaTypes []string) map[string]runtime.Consumer {
	return r.api.ConsumersFor(mediaTypes)
}
func (r *routableUntypedAPI) ProducersFor(mediaTypes []string) map[string]runtime.Producer {
	return r.api.ProducersFor(mediaTypes)
}
func (r *routableUntypedAPI) AuthenticatorsFor(schemes map[string]spec.SecurityScheme) map[string]runtime.Authenticator {
	return r.api.AuthenticatorsFor(schemes)
}
func (r *routableUntypedAPI) Formats() strfmt.Registry {
	return r.api.Formats()
}
func (r *routableUntypedAPI) DefaultProduces() string {
	return r.defaultProduces
}
func (r *routableUntypedAPI) DefaultConsumes() string {
	return r.defaultConsumes
}
