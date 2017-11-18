// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package caliopen_smtp

import (
	"bytes"
	"errors"
	"fmt"
	broker "github.com/CaliOpen/Caliopen/src/backend/brokers/go.emails"
	obj "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"time"
)

// handler is called by smtpd for each incoming email
func (lda *Lda) handler(peer Peer, ev Envelope) error {
	var raw_email bytes.Buffer
	raw_email.WriteString(string(ev.Data))

	emailMessage := obj.EmailMessage{
		Email: &obj.Email{
			SmtpMailFrom: []string{ev.Sender}, //TODO: handle multiple senders
			SmtpRcpTo:    ev.Recipients,
			Raw:          raw_email,
		},
		Message: &obj.Message{},
	}
	incoming := &broker.SmtpEmail{
		EmailMessage: &emailMessage,
		Response:     make(chan *broker.DeliveryAck),
	}
	defer close(incoming.Response)

	lda.brokerConnectors.IncomingSmtp <- incoming

	select {
	case response := <-incoming.Response:
		if response.Err {
			return errors.New(fmt.Sprintf("554 Error : " + response.Response))
		}
		return nil
	case <-time.After(30 * time.Second):
		return errors.New("554 Error: LDA timeout")
	}
}
