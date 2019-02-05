// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package objects

import (
	"errors"
	"strconv"
	"strings"
)

type PrivacyFeatures map[string]string

func (pf *PrivacyFeatures) UnmarshalMap(input map[string]interface{}) {
	for k, v := range input {
		(*pf)[k] = v.(string)
	}
}

// PrivacyFeature store model
type PrivacyFeature struct {
	Name    string   `cql:"name"     json:"name"`
	Type    string   `cql:"type"     json:"type"`
	Min     int      `cql:"min"      json:"min,omitempty"`
	Max     int      `cql:"max" 	 json:"max,omitempty"`
	Default string   `cql:"default"  json:"default,omitempty"`
	ApplyTo []string `cql:"apply_to" json:"apply_to"`
}

// UnmarshalMap return a PrivacyFeature mapped from a store model
func (f *PrivacyFeature) UnmarshalCQLMap(input map[string]interface{}) {

	if name, ok := input["name"].(string); ok {
		f.Name = name
	}
	if type_, ok := input["type"].(string); ok {
		f.Type = type_
	}
	if min, ok := input["min"].(int); ok {
		f.Min = min
	}
	if max, ok := input["max"].(int); ok {
		f.Max = max
	}
	if default_, ok := input["default"].(string); ok {
		f.Default = default_
	}
	// TODO : missing ApplyTo list
}

// Marshall method return a suitable value for storage
func (f *PrivacyFeature) Marshall(input interface{}) (string, error) {
	switch f.Type {
	case "string":
		return input.(string), nil
	case "int":
		return strconv.Itoa(input.(int)), nil
	case "bool":
		if input != nil {
			switch input.(bool) {
			case true:
				return "True", nil
			case false:
				return "False", nil
			}
		}
	}
	return "", errors.New("Invalid PrivacyFeature to marshal")
}

// Unmarshall method return the correct value and type for a feature
func (f *PrivacyFeature) Unmarshall(input string) (interface{}, error) {
	switch f.Type {
	case "string":
		return input, nil
	case "int":
		value, err := strconv.Atoi(input)
		if err != nil {
			return nil, nil
		}
		return value, nil
	case "bool":
		value := strings.ToLower(input)
		if strings.HasPrefix(value, "t") {
			return true, nil
		}
		if strings.HasPrefix(value, "f") {
			return false, nil
		}
	}
	return "", errors.New("Invalid PrivacyFeature to unmarshall")
}
