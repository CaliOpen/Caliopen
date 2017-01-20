package rest_api

import (
        "gopkg.in/gin-gonic/gin.v1"
        "reflect"
)

func SwaggerInboundValidation() gin.HandlerFunc {
        return func(c *gin.Context){
                //TODO
                c.Next()
        }
}

func SwaggerValidator(obj interface{}) gin.HandlerFunc {
        //TODO
        return func(ctx *gin.Context) {
                //var errors Errors
                v := reflect.ValueOf(obj)
                k := v.Kind()
                if k == reflect.Interface || k == reflect.Ptr {
                        v = v.Elem()
                        k = v.Kind()
                }
                if k == reflect.Slice || k == reflect.Array {
                        for i := 0; i < v.Len(); i++ {
                                /*
                                e := v.Index(i).Interface()
                                errors = validateStruct(errors, e)
                                if validator, ok := e.(Validator); ok {
                                        errors = validator.Validate(ctx, errors)
                                }
                                */
                        }
                } else {
                        /*
                        errors = validateStruct(errors, obj)
                        if validator, ok := obj.(Validator); ok {
                                errors = validator.Validate(ctx, errors)
                        }
                        */
                }
                //ctx.Map(errors)
        }
}
