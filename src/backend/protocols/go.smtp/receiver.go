// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package caliopen_smtp

import (
	"bytes"
	broker "github.com/CaliOpen/Caliopen/src/backend/brokers/go.emails"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"time"
)

// handler is called by smtpd for each incoming email
func (lda *Lda) handler(peer Peer, ev SmtpEnvelope) error {
	var raw_email bytes.Buffer
	raw_email.WriteString(string(ev.Data))

	emailMessage := EmailMessage{
		Email: &Email{
			SmtpMailFrom: []string{ev.Sender}, //TODO: handle multiple senders
			SmtpRcpTo:    ev.Recipients,
			Raw:          raw_email,
		},
		Message: &Message{},
	}
	incoming := &broker.SmtpEmail{
		EmailMessage: &emailMessage,
		Response:     make(chan *DeliveryAck),
	}
	defer close(incoming.Response)

	lda.brokerConnectors.Ingress <- incoming

	select {
	case response := <-incoming.Response:
		if response.Err {
			return Error{
				Code:    554,
				Message: response.Response,
			}
		}
		return nil
	case <-time.After(30 * time.Second):
		return Error{
			Code:    554,
			Message: "LDA timeout",
		}
	}
}
