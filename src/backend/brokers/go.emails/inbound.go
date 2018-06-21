// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

// package email_broker handles codec/decodec between emails and Caliopen message format
package email_broker

/* inbound is a Local Delivery Agent :
stores raw incoming emails once in storage
then orders email processing via NATS topic « inboundSMTPEmail »
*/

import (
	"encoding/json"
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/hashicorp/go-multierror"
	"github.com/satori/go.uuid"
	"strings"
	"sync"
	"time"
)

const nats_message_tmpl = "{\"order\":\"%s\",\"user_id\": \"%s\", \"message_id\": \"%s\"}"

func (b *EmailBroker) startIncomingSmtpAgents() error {
	for i := 0; i < b.Config.InWorkers; i++ {
		go b.incomingSmtpWorker()
	}
	//TODO: error handling
	return nil
}

func (b *EmailBroker) incomingSmtpWorker() {
	//  receives values from the channel repeatedly until channel is closed
	for in := range b.Connectors.Ingress {
		if in.EmailMessage == nil {
			log.Warn("[EmailBroker] incomingSmtpWorker received an empty payload")
			ack := &DeliveryAck{
				EmailMessage: in.EmailMessage,
				Err:          true,
				Response:     "empty payload",
			}
			select {
			case in.Response <- ack:
			//write was OK
			default:
				//unable to write, don't block
			}
		}
		go b.processInboundSMTP(in, true)
	}
}

func (b *EmailBroker) startImapAgents() error {
	for i := 0; i < b.Config.InWorkers; i++ {
		go b.imapWorker()
	}
	//TODO: error handling
	return nil
}

func (b *EmailBroker) imapWorker() {
	//  receives values from the channel repeatedly until channel is closed
	for in := range b.Connectors.Ingress {
		if in.EmailMessage == nil {
			log.Warn("[EmailBroker] imapWorker received an empty payload")
			ack := &DeliveryAck{
				EmailMessage: in.EmailMessage,
				Err:          true,
				Response:     "empty payload",
			}
			select {
			case in.Response <- ack:
				//write was OK
			default:
				//unable to write, don't block
			}
		}
		go b.processInboundIMAP(in)
	}
}

func (b *EmailBroker) processInboundSMTP(in *SmtpEmail, raw_only bool) {
	resp := &DeliveryAck{
		EmailMessage: in.EmailMessage,
		Err:          false,
		Response:     "",
	}

	// recipients lookup
	// we need at least one valid local recipient before processing further
	if len(in.EmailMessage.Email.SmtpRcpTo) == 0 {
		resp.Response = "no recipient"
		resp.Err = true
		in.Response <- resp
		return
	}

	if b.Config.LogReceivedMails {
		log.Infof("inbound: processing envelope From: %s -> To: %v", in.EmailMessage.Email.SmtpMailFrom, in.EmailMessage.Email.SmtpRcpTo)
	}

	rcptsIds, err := b.Store.GetUsersForRecipients(in.EmailMessage.Email.SmtpRcpTo)

	if err != nil {
		log.WithError(err).Warn("inbound: recipients lookup failed")
		resp.Response = "recipients store lookup failed"
		resp.Err = true
		in.Response <- resp
		return
	}

	if len(rcptsIds) == 0 {
		resp.Response = "no recipient found in Caliopen domain"
		resp.Err = true
		in.Response <- resp
		return
	}

	b.processInbound(rcptsIds, in, true, resp)
}

func (b *EmailBroker) processInboundIMAP(in *SmtpEmail) {
	// emails coming from imap fetches are not addressed to a local recipient
	// local recipient MUST be embedded in SmtpEmail.Message before calling this method
	resp := &DeliveryAck{
		EmailMessage: in.EmailMessage,
		Err:          false,
		Response:     "",
	}

	if in != nil &&
		in.EmailMessage != nil &&
		in.EmailMessage.Message != nil &&
		in.EmailMessage.Message.User_id.String() != EmptyUUID.String() {
		//TODO : check if user exists
		b.processInbound([]UUID{in.EmailMessage.Message.User_id}, in, true, resp)
	} else {
		resp.Response = "missing user recipient for ingress IMAP message"
		resp.Err = true
		in.Response <- resp
	}
}

// stores raw email + json + message and sends an order on NATS topic for next composant to process it
// if raw_only is true, only stores the raw email with its json representation but do not unmarshal to our message model
func (b *EmailBroker) processInbound(rcptsIds []UUID, in *SmtpEmail, raw_only bool, resp *DeliveryAck) {
	// do not forget to send back ack
	defer func(r *DeliveryAck) {
		in.Response <- r
	}(resp)

	if len(rcptsIds) == 0 {
		return
	}
	// store raw email and get its raw_id
	raw_uuid, err := gocql.RandomUUID()
	var msg_id UUID
	msg_id.UnmarshalBinary(raw_uuid.Bytes())
	m := RawMessage{
		Raw_msg_id: msg_id,
		Raw_Size:   uint64(len(in.EmailMessage.Email.Raw.String())),
		Raw_data:   in.EmailMessage.Email.Raw.String(),
		Delivered:  false,
	}
	err = b.Store.StoreRawMessage(m)
	if err != nil {
		log.WithError(err).Warn("inbound: storing raw email failed")
		resp.Response = "storing raw email failed"
		resp.Err = true
		return
	}

	// send process order to nats for each rcpt
	errs := multierror.Error{
		Errors:      []error{},
		ErrorFormat: ListFormatFunc,
	}
	wg := new(sync.WaitGroup)
	wg.Add(len(rcptsIds))
	for _, rcptId := range rcptsIds {
		go func(rcptId UUID, errs *multierror.Error) {
			defer wg.Done()
			const nats_order = "process_raw"
			natsMessage := fmt.Sprintf(nats_message_tmpl, nats_order, rcptId.String(), m.Raw_msg_id.String())
			// XXX manage timeout correctly
			resp, err := b.NatsConn.Request(b.Config.InTopic, []byte(natsMessage), 10*time.Second)
			if err != nil {
				if b.NatsConn.LastError() != nil {
					log.WithError(b.NatsConn.LastError()).Warnf("[EmailBroker] failed to publish inbound request on NATS for user %s", rcptId.String())
					log.Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
					multierror.Append(errs, b.NatsConn.LastError())
				} else {
					log.WithError(err).Warnf("[EmailBroker] failed to publish inbound request on NATS for user %s", rcptId.String())
					log.Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
					multierror.Append(errs, err)
				}
			} else {
				nats_ack := new(map[string]interface{})
				err := json.Unmarshal(resp.Data, &nats_ack)
				if err != nil {
					log.WithError(err).Warnf("[EmailBroker] failed to parse inbound ack on NATS for user %s", rcptId.String())
					log.Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
					multierror.Append(errs, err)
					return
				}
				if err, ok := (*nats_ack)["error"]; ok {
					log.WithError(errors.New(err.(string))).Warnf("[EmailBroker] inbound delivery failed for user %s", rcptId.String())
					log.Infof("natsMessage: %s\nnatsResponse: %+v\n", natsMessage, resp)
					multierror.Append(errs, errors.New(err.(string)))
					return
				}

				//nats delivery OK
				if b.Config.LogReceivedMails {
					log.Infof("EmailBroker : NATS inbound request successfully handled for user %s : %s", rcptId.String(), (*nats_ack)["message"])
				}

				notif := Notification{
					Emitter: "smtp",
					Type:    EventNotif,
					TTLcode: LongLived,
					User: &User{
						UserId: rcptId,
					},
					NotifId: UUID(uuid.NewV1()),
					Body:    `{"emailReceived": "` + (*nats_ack)["message_id"].(string) + `"}`,
				}

				go b.Notifier.ByNotifQueue(&notif)
			}
		}(rcptId, &errs)
	}
	wg.Wait()
	// we assume the previous MTA did the rcpts lookup, so all rcpts should be OK
	// consequently, we discard the whole delivery if there is at least one error
	// TODO : only report recipients which failed to MTA
	if errs.ErrorOrNil() != nil {
		resp.Response = errs.Error()
		resp.Err = true
		return
	} else {
		// update raw_message table to set raw_message.delivered=true
		b.Store.SetDeliveredStatus(m.Raw_msg_id.String(), true)
	}

}

// deliverMsgToUser marshal an incoming email to the Caliopen message format
// TODO
func (b *EmailBroker) deliverMsgToUser() {}

// ListFormatFunc is a basic formatter that outputs the number of errors
// that occurred along with a bullet point list of the errors but without newlines.
func ListFormatFunc(es []error) string {
	if len(es) == 1 {
		return fmt.Sprintf("1 error occurred:<BR>* %s", es[0])
	}

	points := make([]string, len(es))
	for i, err := range es {
		points[i] = fmt.Sprintf("* %s", err)
	}

	return fmt.Sprintf(
		"%d errors occurred:<BR>%s",
		len(es), strings.Join(points, "<BR>"))
}
