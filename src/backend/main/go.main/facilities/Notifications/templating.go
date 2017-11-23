package Notifications

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"gopkg.in/flosch/pongo2.v3"
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

// RenderResetEmail will load the yaml/j2 template from template_path
// and build the scaffold of a Message with data provided in context map
func RenderResetEmail(template_path string, context map[string]interface{}) (*Message, error) {

	// load email attributes from template file
	var email map[string]interface{}

	file, err := ioutil.ReadFile(template_path)
	if err != nil {
		return nil, err
	}
	yaml.Unmarshal(file, &email)

	// parse subject template
	tpl, err := pongo2.FromString(email["subject"].(string))
	if err != nil {
		return nil, err
	}
	subject, err := tpl.Execute(pongo2.Context(context))
	if err != nil {
		return nil, err
	}

	// parse body_plain
	tpl, err = pongo2.FromString(email["body_plain"].(string))
	if err != nil {
		return nil, err
	}
	body_plain, err := tpl.Execute(pongo2.Context(context))
	if err != nil {
		return nil, err
	}

	// create Message with strings
	return &Message{
		Subject:    subject,
		Body_plain: body_plain,
	}, nil
}
