// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

// package email_broker handles codec/decodec between external emails and Caliopen message format
package email_broker

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/messages"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/jhillyerd/go.enmime"
	"github.com/pkg/errors"
	"github.com/satori/go.uuid"
	"gopkg.in/gomail.v2"
	"io"
	"mime"
	"net/mail"
	"net/textproto"
	"strconv"
	"strings"
	"time"
)

func newAddressesFields() (af map[string][]string) {
	af = map[string][]string{
		"From":     {},
		"Sender":   {},
		"Reply-To": {},
		"To":       {},
		"Cc":       {},
		"Bcc":      {},
	}
	return
}

// build a 'ready to send' email from a Caliopen message model
// conforms to
// RFC822 / RFC2822 / RFC5322 (internet message format)
// RFC2045 / RFC2046 / RFC2047 / RFC2048 / RFC2049 / RFC2183 (MIME) => TODO
func (b *EmailBroker) MarshalEmail(msg *Message) (em *EmailMessage, err error) {

	em = &EmailMessage{
		Email: &Email{
			SmtpMailFrom: []string{},
			SmtpRcpTo:    []string{},
		},
		Message: msg,
	}

	m := gomail.NewMessage()
	addr_fields := newAddressesFields()
	for _, participant := range msg.Participants {
		switch participant.Type {
		case ParticipantFrom:
			addr_fields["From"] = append(addr_fields["From"], m.FormatAddress(participant.Address, participant.Label))
			em.Email.SmtpMailFrom = append(em.Email.SmtpMailFrom, participant.Address) //TODO: handle multisender to conform to RFC5322#3.6.2 (coupled with sender field)
		case ParticipantReplyTo:
			addr_fields["Reply-To"] = append(addr_fields["Reply-To"], m.FormatAddress(participant.Address, participant.Label))
		case ParticipantTo:
			addr_fields["To"] = append(addr_fields["To"], m.FormatAddress(participant.Address, participant.Label))
			em.Email.SmtpRcpTo = append(em.Email.SmtpRcpTo, participant.Address)
		case ParticipantCC:
			addr_fields["Cc"] = append(addr_fields["Cc"], m.FormatAddress(participant.Address, participant.Label))
			em.Email.SmtpRcpTo = append(em.Email.SmtpRcpTo, participant.Address)
		case ParticipantBcc:
			em.Email.SmtpRcpTo = append(em.Email.SmtpRcpTo, participant.Address)
		case ParticipantSender:
			addr_fields["Sender"] = append(addr_fields["Sender"], m.FormatAddress(participant.Address, participant.Label))
			em.Email.SmtpMailFrom = append(em.Email.SmtpMailFrom, participant.Address) //TODO: handle multisender to conform to RFC5322#3.6.2 (coupled with sender field)
		}
	}

	for field, addrs := range addr_fields {
		if len(addrs) > 0 {
			m.SetHeader(field, addrs...)
		}
	}

	em.Message.Date = time.Now()
	m.SetHeader("Date", em.Message.Date.Format(time.RFC1123Z))

	// sha256 internal message id to form external message id
	hasher := sha256.New()
	hasher.Write(em.Message.Message_id.Bytes())
	sha := base64.URLEncoding.EncodeToString(hasher.Sum(nil))
	messageId := sha + "@" + b.Config.PrimaryMailHost // should be the default domain in case there are multiple 'from' addresses
	m.SetHeader("Message-ID", "<"+messageId+">")

	em.Message.External_references.Message_id = messageId

	if msg.External_references.Parent_id != "" {
		m.SetHeader("In-Reply-To", "<"+msg.External_references.Parent_id+">")
		ref := []string{}
		for _, ancestors := range msg.External_references.Ancestors_ids {
			ref = append(ref, "<"+ancestors+">")
		}
		m.SetHeader("References", strings.Join(ref, " "))
	}

	m.SetHeader("X-Mailer", "Caliopen-"+b.Config.AppVersion)

	//TODO: In-Reply-To header
	m.SetHeader("Subject", msg.Subject)
	messages.SanitizeMessageBodies(msg)
	if msg.Body_html != "" {
		m.AddAlternative("text/html", msg.Body_html)
	}
	if msg.Body_plain != "" {
		m.AddAlternative("text/plain", msg.Body_plain)
	}

	for _, attachment := range msg.Attachments {
		//check if file is available in object storage
		if b.Store.AttachmentExists(attachment.URL) {
			//give method to retrieve file from broker storage interface (instead of default filesystem)
			size_str := fmt.Sprintf("%d", attachment.Size)
			content_disposition := `attachment; filename="` + attachment.File_name + `"; size=` + size_str

			m.Attach(attachment.File_name,
				gomail.SetCopyFunc(func(w io.Writer) error {
					file, err := b.Store.GetAttachment(attachment.URL)
					if err != nil {
						return err
					}
					_, err = io.Copy(w, file)
					if err != nil {
						return err
					}
					return nil
				}),
				gomail.SetHeader(map[string][]string{
					"Content-Disposition": {content_disposition},
				}),
			)
		}
	}

	//TODO: errors handling

	m.WriteTo(&em.Email.Raw)
	json_rep, _ := EmailToJsonRep(em.Email.Raw.String())
	em.Email_json = &json_rep
	return
}

// executed by natsMsgHandler after an outgoing email has been transmitted to the MTA without error
//  - flags the caliopen message to 'sent' in cassandra and elastic
//  - cleans-up temporary attachment files if any
//  - stores raw outbound email counterpart
//  - creates discussion lookup entry
func (b *EmailBroker) SaveIndexSentEmail(ack *DeliveryAck) error {

	// save raw email in db
	/*
		json_mail, err := EmailToJsonRep(ack.EmailMessage.Email.Raw.String())
		if err == nil {
			json_mail.Envelope.From = ack.EmailMessage.Email.SmtpMailFrom
			json_mail.Envelope.To = ack.EmailMessage.Email.SmtpRcpTo
		}
	*/
	raw_uuid, err := gocql.RandomUUID()
	var msg_id UUID
	msg_id.UnmarshalBinary(raw_uuid.Bytes())
	m := RawMessage{
		Raw_msg_id: msg_id,
		Raw_Size:   uint64(len(ack.EmailMessage.Email.Raw.String())),
		Raw_data:   ack.EmailMessage.Email.Raw.String(),
	}
	err = b.Store.StoreRawMessage(m)
	if err != nil {
		log.WithError(err).Warn("[Email Broker] outbound: storing raw email failed")
		return err
	}

	// clean-up attachments' temporary files
	for _, attachment := range ack.EmailMessage.Message.Attachments {
		b.Store.DeleteAttachment(attachment.URL)
	}

	// get new references for embedded attachments
	ack.EmailMessage.Message.Attachments = []Attachment{}
	for part := range ack.EmailMessage.Email_json.MimeRoot.Parts.Walk() {
		if part.Is_attachment {
			disposition, dparams, err := mime.ParseMediaType(part.Headers["Content-Disposition"][0])
			if err == nil {
				is_inline := false
				if disposition == "inline" {
					is_inline = true
				}
				size, _ := strconv.Atoi(dparams["size"])
				ack.EmailMessage.Message.Attachments = append(ack.EmailMessage.Message.Attachments, Attachment{
					Content_type: part.ContentType,
					File_name:    dparams["filename"],
					Is_inline:    is_inline,
					Size:         size,
					MimeBoundary: part.Boundary,
				})
			}
		}
	}
	// Retrieve user informations
	user, err := b.Store.RetrieveUser(ack.EmailMessage.Message.User_id.String())
	if err != nil {
		return err
	}
	user_info := &UserInfo{User_id: user.UserId.String(), Shard_id: user.ShardId}

	// update caliopen message status
	fields := make(map[string]interface{})

	fields["Raw_msg_id"] = m.Raw_msg_id.String()
	fields["Is_draft"] = false
	fields["Date"] = ack.EmailMessage.Message.Date
	fields["Attachments"] = ack.EmailMessage.Message.Attachments
	fields["External_references"] = ack.EmailMessage.Message.External_references
	err = b.Store.UpdateMessage(ack.EmailMessage.Message, fields)
	if err != nil {
		log.WithError(err).Warn("[Email Broker] Store.UpdateMessage operation failed")
	}
	err = b.Index.UpdateMessage(user_info, ack.EmailMessage.Message, fields)
	if err != nil {
		log.WithError(err).Warn("[Email Broker] Index.UpdateMessage operation failed")
	}

	// if needed :
	// insert new entry into discussion_lookup table
	// with message's external reference
	if ack.EmailMessage.Message.External_references.Parent_id == "" {
		err = b.Store.CreateThreadLookup(ack.EmailMessage.Message.User_id,
			ack.EmailMessage.Message.Discussion_id,
			ack.EmailMessage.Message.External_references.Message_id)
		if err != nil {
			log.WithError(err).Warn("[Email Broker] Store.CreateThreadLookup operation failed")
		}
	}
	return err
}

// gets a raw email and transforms into a Caliopen 'message' object
// belonging to an user
func (b *EmailBroker) UnmarshalEmail(em *EmailMessage, user_id UUID) (msg *Message, err error) {

	parsed_mail, err := mail.ReadMessage(&em.Email.Raw)
	if err != nil {
		log.WithError(err).Warn("[Email Broker] unable to parse email with raw_id : %s", em.Message.Raw_msg_id)
		return nil, err
	}

	var m_id UUID
	m_id.UnmarshalBinary(uuid.NewV4().Bytes())
	mail_date, err := parsed_mail.Header.Date()
	if err != nil {
		log.WithError(err).Warn("[Email Broker] unable to parse email's date")
	}

	/*
		mail_body, err := ioutil.ReadAll(parsed_mail.Body)
		if err != nil {
			log.WithError(err).Warn("unable to parse email's body")
		}
	*/
	//TODO: Body parts, Attachments, Externals_references, identities, parent_id…
	msg = &Message{
		Date:             mail_date,
		Date_insert:      time.Now(),
		Is_unread:        true,
		Message_id:       m_id,
		Participants:     []Participant{},
		Privacy_features: &PrivacyFeatures{},
		Raw_msg_id:       em.Message.Raw_msg_id,
		Subject:          parsed_mail.Header.Get("subject"),
		Type:             EmailProtocol,
		User_id:          user_id,
	}

	for field := range newAddressesFields() {
		p, err := b.unmarshalParticipants(parsed_mail.Header, field, user_id)
		if err == nil {
			msg.Participants = append(msg.Participants, p...)
		}
	}

	return
}

// if an user_id is provided, the func will try to find a matching contact for each recipient within user's contactbook in db
// otherwise, contact_id will be nil for recipient
func (b *EmailBroker) unmarshalParticipants(h mail.Header, address_type string, user_id ...UUID) (participants []Participant, err error) {
	participants = []Participant{}
	addresses, err := h.AddressList(address_type)
	if err != nil {
		return participants, err
	}
	for _, a := range addresses {
		rcpt := Participant{
			Type:        address_type,
			Protocol:    EmailProtocol,
			Address:     a.Address,
			Label:       a.Name,
			Contact_ids: []UUID{},
		}
		if len(user_id) == 1 {
			contact_ids, err := b.Store.LookupContactsByIdentifier(user_id[0].String(), a.Address)
			if err == nil {
				for _, id := range contact_ids {
					var contact_id UUID
					uuid, _ := uuid.FromString(id)
					contact_id.UnmarshalBinary(uuid.Bytes())
					rcpt.Contact_ids = append(rcpt.Contact_ids, contact_id)
				}
			}
		}
		participants = append(participants, rcpt)
	}

	return
}

// returns an EmailJson object which is our json representation of the raw email
// in particular, attachments are qualified following Caliopen's rules
// (see addChildPart() func for attachment qualification algorithm)
func EmailToJsonRep(email string) (json_email EmailJson, err error) {
	reader := bytes.NewReader([]byte(email))
	msg, err := mail.ReadMessage(reader) // Read email using Go's net/mail
	if err != nil {
		return
	}
	mm, err := enmime.ParseMIMEBody(msg) // Parse message body with enmime
	if err != nil {
		return
	}

	json_email = EmailJson{
		Addresses: []EmailAddress{},
		Headers:   map[string][]string{},
	}

	for k, v := range msg.Header {
		switch strings.ToLower(k) {
		case "from", "to", "cc", "bcc", "reply-to", "sender":
			addr_ptrs, err := msg.Header.AddressList(k)
			if err == nil {
				var addr []EmailAddress
				for _, addr_ptr := range addr_ptrs {
					addr = append(addr, EmailAddress{
						*addr_ptr,
						k,
					})
				}
				json_email.Addresses = append(json_email.Addresses, addr...)
			}
		case "date":
			json_email.Date = v[0] //TODO : manage multiple date fields
		case "subject":
			json_email.Subject = v[0] //TODO : manage multiple subject fields
		}
		json_email.Headers[k] = v
	}

	json_email.Html = mm.HTML
	json_email.Plain = mm.Text
	json_email.IsTextFromHTML = mm.IsTextFromHTML

	if mm.Root != nil {
		//message was MIME encoded, build the mime tree
		root_part_content_type := mm.GetHeader("Content-Type")
		root_boundary, _ := GetBoundary(root_part_content_type)
		json_email.MimeRoot = MimeRoot{
			Attachments_count: len(mm.Attachments),
			Root_boundary:     root_boundary,
			Inline_count:      len(mm.Inlines),
			Parts:             []Part{},
		}
		mm.Root.SetHeader(textproto.MIMEHeader{
			"Content-Type": []string{root_part_content_type},
		})
		child := mm.Root.FirstChild()
		if child != nil {
			json_email.MimeRoot.Parts = addChildPart(json_email.MimeRoot.Parts, child)
			for sibling := child.NextSibling(); sibling != nil; sibling = sibling.NextSibling() {
				json_email.MimeRoot.Parts = addChildPart(json_email.MimeRoot.Parts, sibling)
			}
		}

	}
	return json_email, nil
}

// Build part tree recursively
// and compute properties for each part
func addChildPart(parent []Part, part enmime.MIMEPart) []Part {

	child := Part{
		Parts: []Part{},
	}
	if content_type, ok := part.Parent().Header()["Content-Type"]; ok {
		var e error
		child.Boundary, e = GetBoundary(content_type[0])
		if e != nil {
			child.Boundary = ""
		}
	}
	child.Charset = part.Charset()
	child.Content = part.Content()
	child.ContentType = part.ContentType()
	child.Headers = part.Header()

	disposition, _, _ := mime.ParseMediaType(part.Header().Get("Content-Disposition"))
	if strings.ToLower(disposition) == "attachment" {
		child.Is_attachment = true
	}
	if strings.ToLower(disposition) == "inline" {
		child.Is_attachment = true
		child.Is_inline = true
	}

	attachment_types := map[string]bool{
		"application": true,
		"image":       true,
		"video":       true,
		"audio":       true,
		"message":     true,
		"font":        true,
	}

	mainType := strings.Split(strings.ToLower(child.ContentType), "/")[0]
	if _, ok := attachment_types[mainType]; ok {
		child.Is_attachment = true
	}

	sub_child := part.FirstChild()
	if sub_child != nil {
		child.Parts = addChildPart(child.Parts, sub_child)
		for sibling := sub_child.NextSibling(); sibling != nil; sibling = sibling.NextSibling() {
			child.Parts = addChildPart(child.Parts, sub_child)
		}
	}

	return append(parent, child)
}

// Returns the boundary string from a part header
func GetBoundary(s string) (boundary string, err error) {
	mediatype, params, err := mime.ParseMediaType(s)
	if err != nil {
		return "", err
	}
	if strings.HasPrefix(mediatype, "multipart") {
		boundary = params["boundary"]
		if err != nil {
			return "", err
		}
		return boundary, nil
	} else {
		return "", errors.New("no boundary")
	}
}
