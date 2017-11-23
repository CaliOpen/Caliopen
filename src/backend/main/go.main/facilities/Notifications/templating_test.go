package Notifications

import "testing"

func TestRenderResetEmail(t *testing.T) {
	email, err := RenderResetEmail(
		"/usr/local/goland/src/github.com/CaliOpen/Caliopen/src/backend/defs/notifiers/templates/email-reset-password-link.yaml",
		map[string]interface{}{
			"url": "the local host",
		},
	)
	if err != nil {
		t.Error(err)
	} else {
		t.Logf("%+v", email)
	}
}
