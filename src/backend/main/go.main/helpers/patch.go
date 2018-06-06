// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package helpers

import (
	"encoding/json"
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/tidwall/gjson"
	"gopkg.in/oleiade/reflections.v1"
	"reflect"
)

type errHandler struct {
	err error
}

type patch struct {
	actor                Initiator
	currentState         ObjectPatchable
	dbState              ObjectPatchable
	fieldsInCurrentState map[string]interface{}
	fieldsInPatch        map[string]interface{}
	jsonMap              map[string]string // keys are json properties, values are struct Field name counterpart
	newState             ObjectPatchable
	raw                  []byte
}

// UpdateWithPatch replace obj with updated version according to patch directives if everything went well.
// It returns fields that have been effectively modified.
func UpdateWithPatch(patch []byte, obj ObjectPatchable, actor Initiator) (newObj ObjectPatchable, modifiedFields map[string]interface{}, err error) {

	p, err := buildPatch(patch, obj, actor)
	if err != nil {
		return obj, nil, err
	}

	err = validateCurrentState(p)
	if err != nil {
		return obj, nil, err
	}

	// squash newState values with dbState values for those that he's not allowed to modify
	validatedFields, err := validateActorRights(p.dbState, p.newState, p.actor)
	if err != nil {
		return obj, nil, err
	}

	// ensure mandatory properties are present
	p.newState.MarshallNew()

	// copy fields that have been validated and modified into the map that will be returned.
	modifiedFields = map[string]interface{}{}
	for key, _ := range p.fieldsInPatch {
		fieldName := p.jsonMap[key]
		if value, ok := validatedFields[fieldName]; ok {
			modifiedFields[fieldName] = value
		}
	}

	return p.newState, modifiedFields, nil
}

//
func buildPatch(rawPatch []byte, dbState ObjectPatchable, actor Initiator) (*patch, error) {

	patch := patch{
		actor:                actor,
		dbState:              dbState,
		fieldsInCurrentState: map[string]interface{}{},
		fieldsInPatch:        map[string]interface{}{},
		jsonMap:              dbState.JsonTags(),
		raw:                  rawPatch,
	}

	// unmarshal raw json to a map[string]interface{}
	err := json.Unmarshal(rawPatch, &patch.fieldsInPatch)
	if err != nil {
		return nil, err
	}

	// get raw 'current_state' from patch and apply it to currentState object
	patch.currentState = dbState.NewEmpty().(ObjectPatchable)
	reflect.ValueOf(patch.currentState).Elem().Set(reflect.ValueOf(dbState).Elem()) // now patch.currentState has same kind than object counterpart

	patch.fieldsInCurrentState = patch.fieldsInPatch["current_state"].(map[string]interface{})
	err = patch.currentState.UnmarshalMap(patch.fieldsInCurrentState)
	if err != nil {
		return nil, err
	}

	// remove 'current_state' before creating the newState from remaining properties
	delete(patch.fieldsInPatch, "current_state")
	patch.newState = dbState.NewEmpty().(ObjectPatchable)
	reflect.ValueOf(patch.newState).Elem().Set(reflect.ValueOf(dbState).Elem())
	err = patch.newState.UnmarshalMap(patch.fieldsInPatch)
	if err != nil {
		return nil, err
	}
	return &patch, nil
}

//
func validateCurrentState(patch *patch) (err error) {

	// before comparing dbState and currentState we must ensure that embedded slices are sorted the same way
	patch.dbState.SortSlices()
	patch.currentState.SortSlices()
	patch.newState.SortSlices()

	// check global equality
	// TODO: add a compare(a,b T) func to CaliopenObject interface
	if !reflect.DeepEqual(patch.dbState, patch.currentState) {
		return NewCaliopenErr(UnprocessableCaliopenErr, "current state not consistent with db state")
	}

	// seek for keys within patch that are not in current_state meaning patch wants to add the key,
	// consequently the value in db should equals to default zero
	emptyState := patch.dbState.NewEmpty()
	for key, _ := range patch.fieldsInPatch {
		field := patch.jsonMap[key]
		if ok, err := reflections.HasField(patch.dbState, field); err != nil || !ok {
			return NewCaliopenErrf(UnprocessableCaliopenErr, "struct %s has no key %", reflect.TypeOf(patch.dbState).String(), key)
		}
		if _, present := patch.fieldsInCurrentState[key]; !present {
			empty, err1 := reflections.GetField(emptyState, field)
			store, err2 := reflections.GetField(patch.dbState, field)
			if err1 != nil || err2 != nil {
				return NewCaliopenErrf(UnprocessableCaliopenErr, "[Patch] failed to retrieve field <%s> from object", field)
			}
			if !reflect.DeepEqual(store, empty) {
				return NewCaliopenErrf(UnprocessableCaliopenErr, "[Patch] field <%s> not consistent with db state", field)
			}
		}
	}

	return nil
}

// validateActorRights iterate recursively over dbState fields to prevent actor to modify those that he hasn't right on.
// If a field is protected against current actor, its value is replaced by its value from db,
// otherwise field name and value are copied to validatedFields for later use
// dbState and newState must be pointers to structs, but dbState could be a nil pointer
func validateActorRights(dbState, newState interface{}, actor Initiator) (validatedFields map[string]interface{}, err error) {

	validatedFields = map[string]interface{}{}

	fieldsCount := reflect.TypeOf(newState).Elem().NumField()
	for i := 0; i < fieldsCount; i++ {
		fieldName := reflect.TypeOf(newState).Elem().Field(i).Name
		if canModifyProperty(newState, fieldName, actor) {
			fieldKind, _ := reflections.GetFieldKind(newState, fieldName)
			switch fieldKind {
			case reflect.Slice:
				sliceNew := reflect.ValueOf(newState).Elem().FieldByName(fieldName)

				// check if it's a slice of structs
				if sliceNew.Len() > 0 {
					switch sliceNew.Index(0).Kind() {
					case reflect.Struct:
						if _, ok := sliceNew.Index(0).Addr().Interface().(ObjectPatchable); ok {
							// iterate over items to check rights on sub-fields.
							sliceDB := reflect.ValueOf(dbState).Elem().FieldByName(fieldName)
							for i := 0; i < sliceNew.Len(); i++ {
								// check that we have a db counterpart before calling validateActorRights
								if i < sliceDB.Len() {
									_, err := validateActorRights(sliceDB.Index(i).Addr().Interface(), sliceNew.Index(i).Addr().Interface(), actor)
									if err != nil {
										return nil, err
									}
								} else {
									_, err := validateActorRights(nil, sliceNew.Index(i).Addr().Interface(), actor)
									if err != nil {
										return nil, err
									}
								}

							}
						}
					}
				}
				validatedFields[fieldName], _ = reflections.GetField(newState, fieldName)
			case reflect.Struct:
				subNew, _ := reflections.GetField(newState, fieldName)
				if _, ok := subNew.(ObjectPatchable); ok {
					// we must check rights on sub-fields.
					var subDB *interface{}
					if dbState != nil {
						f, err := reflections.GetField(dbState, fieldName)
						if err != nil {
							return nil, WrapCaliopenErr(err, UnprocessableCaliopenErr, "validateActorRights failed")
						}
						subDB = &f
					} else {
						subDB = nil
					}
					_, err = validateActorRights(subDB, &subNew, actor)
					if err != nil {
						return nil, err
					}
					validatedFields[fieldName], _ = reflections.GetField(newState, fieldName)
				}
			default:
				// no sub-level, field could be updated directly
				validatedFields[fieldName], _ = reflections.GetField(newState, fieldName)
			}
		} else {
			// actor can't patch this field
			if dbState != nil {
				// try to silently discard the field by replacing it with value from db
				dbValue, err := reflections.GetField(dbState, fieldName)
				if err != nil {
					return nil, WrapCaliopenErrf(err, UnknownCaliopenErr, "validateActorRights failed to fetch field %s", fieldName)
				}
				reflections.SetField(newState, fieldName, dbValue)
			} else {
				// no counterpart available in db, set field to zero
				fieldType := reflect.TypeOf(newState).Elem().Field(i).Type
				reflections.SetField(newState, fieldName, reflect.New(fieldType).Elem().Interface())
			}
		}
	}

	return validatedFields, nil
}

// canModifyProperty returns true if and only if Initiator has rights to modify the property of the object.
// directive comes from the "patch" tag found within struct declaration
func canModifyProperty(obj interface{}, field string, actor Initiator) bool {
	rightLevel := Unknown
	directive, err := reflections.GetFieldTag(obj, field, "patch")
	if directive != "" && err == nil {
		if level, ok := Initiators[directive]; ok {
			rightLevel = level
		}
	}
	return rightLevel >= actor // if rightLevel is below actor level, then actor has not the right to modify
}

// func to do the parsing once and get a pointer to the result.
func ParsePatch(json []byte) (*gjson.Result, error) {
	if !gjson.Valid(string(json)) {
		return nil, errors.New("invalid json")
	}
	r := gjson.ParseBytes(json)
	return &r, nil
}
