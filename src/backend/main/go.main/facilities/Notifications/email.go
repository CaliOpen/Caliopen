// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package Notifications

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/CaliOpen/Caliopen/src/backend/brokers/go.emails"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/satori/go.uuid"
	"time"
)

type EmailNotifiers interface {
	SendEmailAdminToUser(user *User, email *Message) error
	SendPasswordResetEmail(user *User, session *Pass_reset_session) error
}

const (
	resetPasswordTemplate = "email-reset-password-link.yaml"
	resetLinkFmt          = "%s/auth/passwords/reset/%s"
)

// SendEmailAdminToUser sends an administrative email to user, ie :
// this is an email composed by the backend to inform user that something happened related to its account
// func is in charge of saving & indexing draft before sending the "deliver" order to the SMTP broker.
func (notif *Notifier) SendEmailAdminToUser(user *User, email *Message) error {
	if notif.admin == nil {
		err := errors.New("[NotificationsFacility] can't SendEmailAdminToUser, no admin user has been set")
		log.Warn(err)
		return err
	}

	sender := Participant{
		Address:  (*notif.adminLocalID).Identifier,
		Label:    (*notif.adminLocalID).Display_name,
		Protocol: EmailProtocol,
		Type:     ParticipantFrom,
	}
	recipient := Participant{
		Address:     user.RecoveryEmail,
		Contact_ids: []UUID{user.ContactId},
		Label:       user.Name,
		Protocol:    EmailProtocol,
		Type:        ParticipantTo,
	}
	now := time.Now()
	(*email).Date = now
	(*email).Date_insert = now
	(*email).Message_id.UnmarshalBinary(uuid.NewV4().Bytes())
	(*email).Discussion_id.UnmarshalBinary(uuid.NewV4().Bytes())
	(*email).Is_draft = true
	(*email).Participants = []Participant{sender, recipient}
	(*email).Type = EmailProtocol
	(*email).User_id = notif.admin.UserId

	// save & index message
	err := notif.store.CreateMessage(email)
	if err != nil {
		log.WithError(err).Warn("[EmailNotifiers]: SendEmailAdminToUser failed to store draft")
		return err
	}
	user_info := &UserInfo{User_id: user.UserId.String(), Shard_id: user.ShardId}
	err = notif.index.CreateMessage(user_info, email)
	if err != nil {
		log.WithError(err).Warn("[EmailNotifiers]: SendEmailAdminToUser failed to index draft")
		return err
	}

	log.Infof("[NotificationsFacility] sending email admin for user <%s> [%s]", user.Name, user.UserId.String())
	const nats_order = "deliver"
	natsMessage := fmt.Sprintf(Nats_message_tmpl, nats_order, email.Message_id.String(), notif.admin.UserId.String())
	rep, err := notif.queue.Request(notif.nats_outSMTP_topic, []byte(natsMessage), 30*time.Second)
	if err != nil {
		log.WithError(err).Warn("[EmailNotifiers]: SendEmailAdminToUser error")
		if notif.queue.LastError() != nil {
			log.WithError(notif.queue.LastError()).Warn("[EmailNotifiers]: SendEmailAdminToUser error")
			return err
		}
		return err
	}
	var reply email_broker.DeliveryAck
	err = json.Unmarshal(rep.Data, &reply)
	if err != nil {
		log.WithError(err).Warn("[EmailNotifiers]: SendEmailAdminToUser error")
		return err
	}
	if reply.Err {
		err := errors.New(reply.Response)
		log.WithError(err).Warn("[EmailNotifiers]: SendEmailAdminToUser error")
		return err
	}
	return nil
}

func (notif *Notifier) SendPasswordResetEmail(user *User, session *Pass_reset_session) error {
	if user == nil || session == nil {
		return errors.New("[NotificationsFacility] SendPasswordResetEmail invalid params")
	}

	reset_link := fmt.Sprintf(resetLinkFmt, notif.config.BaseUrl, session.Reset_token)
	context := map[string]interface{}{
		"given_name":  user.GivenName,
		"family_name": user.FamilyName,
		"domain":      notif.config.BaseUrl,
		"url":         reset_link,
	}
	email, err := RenderResetEmail(notif.config.TemplatesPath+resetPasswordTemplate, context)
	if err != nil {
		log.WithError(err).Warnf("[RESTfacility] failed to build reset email from template for user %s", user.UserId.String())
		return errors.New("[RESTfacility] failed to build reset email")
	}

	err = notif.SendEmailAdminToUser(user, email)

	if err != nil {
		log.WithError(err).Warnf("[RESTfacility] sending password reset email failed for user %s", user.UserId.String())
		return errors.New("[RESTfacility] failed to send password reset email")
	}

	return nil
}
