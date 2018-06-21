// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"bytes"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"gopkg.in/oleiade/reflections.v1"
	"reflect"
	"strings"
	"time"
)

// this interface is mainly a collection of helpers to facilitate the job of reflection
type CaliopenObject interface {
	// NewEmpty returns the pointer returned by the new() builtin applied to the underlying object and its nested objects if needed
	NewEmpty() interface{}
	// UnmarshalJSON is json.Unmarshaller interface
	UnmarshalJSON(b []byte) error
	// UnmarshalMap hydrate struct with data from a map[string]interface{}
	UnmarshalMap(map[string]interface{}) error
	// NewMarshaller ensure mandatory properties are corretly set on struct
	NewMarshaller
}

// types below are helpers to manage embedded and related struct within storage
// as well as lookup tables.
type (
	// objects with embedded struct that must be stored alongside their parent.
	HasNested interface {
		GetSetNested() <-chan interface{}
	}

	// objects with joined objects stored in separate table
	HasRelated interface {
		GetRelatedList() map[string]interface{} // returns a map[PropertyKey]Type of structs that are embedded into a struct from joined table(s)
		GetSetRelated() <-chan interface{}      // returns a chan to iterate over embedded structs
	}

	// objects with related tables that must be maintained up-to-date
	HasLookup interface {
		GetLookupsTables() map[string]StoreLookup // returns a map[tableName]interface{} with table(s) name(s) and model(s) of the lookup table(s)
		GetLookupKeys() <-chan StoreLookup        // returns a chan to iterate over fields and values that make up the lookup tables keys
	}

	NewMarshaller interface {
		MarshallNew(...interface{}) // ensure mandatory properties are correctly set on new structs.
	}

	StoreLookup interface {
		CleanupLookups(...interface{}) func(session *gocql.Session) error // returns a func for CassandraBackend that cleanups lookups table
		UpdateLookups(...interface{}) func(session *gocql.Session) error  // returns a func for CassandraBackend that creates/updates lookups table
	}
	// structs capable of returning JSON representation suitable for frontend client
	FrontEndMarshaller interface {
		MarshalFrontEnd() ([]byte, error)
	}

	ObjectPatchable interface {
		CaliopenObject
		// JsonTags returns a map[string]string of the "json" tags found for each object property
		// map key is the tag value (json:"xxxx"), mapping to the corresponding struct property name
		JsonTags() map[string]string
		// SortSlices sorts all slices embedded in the struct in a determinist way
		SortSlices()
		// TODO: add a compare(a,b T) func to CaliopenObject interface
	}
)

// generic implementation of the jsonTags func (see above) for CaliopenObject interface
func jsonTags(obj interface{}) (tags map[string]string) {
	tags = make(map[string]string)
	fields, err := reflections.Fields(obj)
	if err != nil {
		return
	}
	for _, field := range fields {
		tag, err := reflections.GetFieldTag(obj, field, "json")
		split := strings.Split(tag, ",")
		if err == nil {
			tags[split[0]] = field
		}
	}
	return
}

// MarshalNested calls MarshalNew() on nested structs
func MarshalNested(obj HasNested) {
	for nested := range obj.GetSetNested() {
		if nest, ok := nested.(NewMarshaller); ok {
			nest.MarshallNew()
		}
	}
}

// MarshalNested calls MarshalNew() on related structs
func MarshalRelated(obj HasRelated) {
	for related := range obj.GetSetRelated() {
		if rel, ok := related.(NewMarshaller); ok {
			rel.MarshallNew(obj)
		}
	}
}

// bespoke implementation of the json.Marshaller interface
// outputs a JSON representation of an object
// this marshaller takes account of custom tags for given 'context'
func JSONMarshaller(context string, obj interface{}) ([]byte, error) {
	var jsonBuf bytes.Buffer
	enc := json.NewEncoder(&jsonBuf)

	fields, err := reflections.Fields(obj)
	if err != nil {
		return jsonBuf.Bytes(), err
	}
	jsonBuf.WriteByte('{')
	first := new(bool)
	*first = true
fieldsLoop:
	for _, field := range fields {
		switch context {
		case "elastic":
			j_elastic, err := reflections.GetFieldTag(obj, field, "elastic")
			if err == nil {
				switch j_elastic {
				case "omit":
					continue fieldsLoop
				}
			}
		case "frontend":
			front, err := reflections.GetFieldTag(obj, field, "frontend")
			if err == nil {
				switch front {
				case "omit":
					continue fieldsLoop
				}
			}
		}
		marshallField(obj, field, context, &jsonBuf, first, enc)
	}
	jsonBuf.WriteByte('}')
	return jsonBuf.Bytes(), nil
}

func marshallField(obj interface{}, field, context string, jsonBuf *bytes.Buffer, first *bool, enc *json.Encoder) {
	j_field, err := reflections.GetFieldTag(obj, field, "json")
	if err != nil {
		log.WithError(err).Warnf("reflection for field %s failed", field)
	} else {
		if j_field != "" && j_field != "-" {
			split := strings.Split(j_field, ",")
			if len(split) > 1 && split[1] == "omitempty" {
				// check if field is empty
				f, e := reflections.GetField(obj, field)
				if e != nil {
					return
				}
				if isEmptyValue(reflect.ValueOf(f)) {
					return
				}
			}
			if *first {
				*first = false
			} else {
				jsonBuf.WriteByte(',')
			}

			jsonBuf.WriteString("\"" + split[0] + "\":")

			// recursively apply JSONMarshaller to embedded structs
			fieldKind, _ := reflections.GetFieldKind(obj, field)
			field_value, err := reflections.GetField(obj, field)
			j_formatter, err := reflections.GetFieldTag(obj, field, "formatter")

			if err == nil {
				if fieldKind == reflect.Slice {
					value := reflect.ValueOf(field_value)
					if value.Len() > 0 {
						// check if it's a slice of structs before iterating
						if value.Index(0).Kind() == reflect.Struct {
							subFirst := true
							jsonBuf.WriteByte('[')
							for i := 0; i < value.Len(); i++ {
								b, e := JSONMarshaller(context, value.Index(i).Interface())
								if e == nil {
									if subFirst {
										subFirst = false
									} else {
										jsonBuf.WriteByte(',')
									}
									jsonBuf.Write(b)
								}
							}
							jsonBuf.WriteByte(']')
							return
						} else {
							enc.Encode(field_value)
							return
						}
					}
				}
				switch j_formatter {
				case "RFC3339Milli":
					jsonBuf.WriteString("\"" + field_value.(time.Time).Format(RFC3339Milli) + "\"")
				default:
					var b []byte
					var e error
					if fieldKind == reflect.Struct {
						b, e = JSONMarshaller(context, field_value)
					} else if fieldKind == reflect.Ptr && field_value != nil {
						value_at := reflect.Indirect(reflect.ValueOf(field_value))
						if value_at.Type().Kind() == reflect.Struct {
							b, e = JSONMarshaller(context, value_at.Interface())
						} else {
							enc.Encode(field_value)
							return
						}
					} else {
						enc.Encode(field_value)
						return
					}
					if e == nil {
						jsonBuf.Write(b)
					} else {
						jsonBuf.WriteString("null")
					}
				}
			} else {
				jsonBuf.Write([]byte{'"', '"'})
			}
		}
	}
}

// borrowed from pkg/encoding/json/encode.go
// add checks for :
//  - time.Time
//  - custom type UUID
func isEmptyValue(v reflect.Value) bool {
	switch v.Kind() {
	case reflect.Array:
		if reflect.TypeOf(v.Interface()) == reflect.TypeOf(EmptyUUID) {
			return v.Len() == 0 || (bytes.Equal(v.Interface().(UUID).Bytes(), EmptyUUID.Bytes()))
		} else {
			return v.Len() == 0
		}
	case reflect.Map, reflect.Slice, reflect.String:
		return v.Len() == 0
	case reflect.Bool:
		return !v.Bool()
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return v.Int() == 0
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return v.Uint() == 0
	case reflect.Float32, reflect.Float64:
		return v.Float() == 0
	case reflect.Interface, reflect.Ptr:
		return v.IsNil()
	case reflect.Struct:
		if v.Type().String() == "time.Time" {
			return v.Interface().(time.Time).IsZero()
		}
		//TODO: CaliopenObjects should implement IsEmpty() for checking empty struct
	}
	return false
}
