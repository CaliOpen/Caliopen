package objects

import (
	"bytes"
	"github.com/satori/go.uuid"
	"net/mail"
)

type (
	// EmailMessage is a wrapper to handle the relationship
	// between a raw email, its json representation and its Caliopen message counterpart
	EmailMessage struct {
		Email      *Email
		Email_json *EmailJson
		Message    *Message
	}

	//email is a basic container to handle incoming & outcoming raw emails.
	Email struct {
		SmtpMailFrom []string     // from or for the smtp agent
		SmtpRcpTo    []string     // from or for the smtp agent
		Raw          bytes.Buffer // raw email (without the Bcc header)
		//TODO: add more infos from mta
	}

	//json representation of a parsed raw email.
	EmailJson struct {
		Addresses      []EmailAddress      // all email addresses extracted from address fields
		Date           string              // the exact string found. No treatment at all
		Envelope       Envelope            // smtp envelope from MTA
		Headers        map[string][]string // repeated headers are grouped into one
		Html           string              // html body mime part, if any
		IsTextFromHTML bool                // plain text was empty; down-converted HTML
		MimeRoot       MimeRoot            // the top level mime part, if any
		Plain          string              // plain text body
		Subject        string
	}

	EmailAddress struct {
		Addr  mail.Address
		Field string // To, From, etc. = field where email address was
	}

	Envelope struct {
		To          []string // the email addresses the server is sending to.
		Recipients  []string // the full list of recipients that the remote server is attempting to send to.
		From        []string // the email addresses that the server was sending from.
		Helo_domain string   // the domaine reported by the sending server
		Remote_ip   string   // the remote IP address of the sending server
		Spf         string   // the SPF result for the given IP address and domain
	}

	//struct to hold mime parts logic
	MimeRoot struct {
		Attachments_count int
		Root_boundary     string
		Inline_count      int
		Parts             Parts
	}

	Part struct {
		Boundary      string
		Charset       string
		Content       []byte
		ContentType   string
		Headers       map[string][]string
		Is_attachment bool
		Is_inline     bool
		Parts         Parts
	}

	Parts []Part

	// emails model embedded in contact
	EmailContact struct {
		Address   string `cql:"address"     json:"address"`
		EmailId   UUID   `cql:"email_id"    json:"email_id"`
		IsPrimary bool   `cql:"is_primary"  json:"is_primary"`
		Label     string `cql:"label"       json:"label"`
		Type      string `cql:"type"        json:"type"`
	}
)

// Returns a flattened array of attachments' bytes, ordered by precedence (in depth-first order, see Walk() func below)
// function walks through email's parts tree to find parts that are labelled «is_attachment»
// if an (optional) index is provided, the func returns bytes for the referenced attachment only
// attachments are decoded according to "Content-Transfer-Encoding" header.
func (email EmailJson) ExtractAttachments(index ...int) (attachments [][]byte, err error) {
	i := 0
	withIndex := false
	if len(index) == 1 {
		withIndex = true
	}
	for part := range email.MimeRoot.Parts.Walk() {
		if part.Is_attachment {
			if withIndex {
				if i == index[0] {
					attachments = append(attachments, part.Content)
					return
				}
			} else {
				attachments = append(attachments, part.Content)
			}
			i++
		}
	}
	return
}

// mimic Python's email.walk() func :
// Walk over the message tree, yielding each subpart.
// The walk is performed in depth-first order.  This method is an iterator.
// usage : for part := range parts.Walk() {…}
func (parts Parts) Walk() (partChan chan Part) {
	partChan = make(chan Part)
	if len(parts) < 1 {
		close(partChan)
		return
	}
	go func() {
		for _, part := range parts {
			partChan <- part
			if len(part.Parts) > 0 {
				for sub_part := range part.Parts.Walk() {
					partChan <- sub_part
				}
			}
		}
		close(partChan)
	}()
	return
}

func (ec *EmailContact) UnmarshalMap(input map[string]interface{}) error {
	ec.Address, _ = input["address"].(string)
	if email_id, ok := input["email_id"].(string); ok {
		if id, err := uuid.FromString(email_id); err == nil {
			ec.EmailId.UnmarshalBinary(id.Bytes())
		}
	}
	ec.IsPrimary, _ = input["is_primary"].(bool)
	ec.Label, _ = input["label"].(string)
	ec.Type, _ = input["type"].(string)
	return nil //TODO: errors handling
}
