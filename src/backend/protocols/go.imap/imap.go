/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package imap_worker

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/users"
	log "github.com/Sirupsen/logrus"
	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
	"github.com/emersion/go-sasl"
	"strconv"
	"strings"
	"time"
)

// ImapFetcherHeaders are headers added to emails fetched from remote IMAP
type ImapFetcherHeaders map[string]string

const (
	//gmail related
	gmail_msgid  = "X-GM-MSGID"
	gmail_labels = "X-GM-LABELS"
)

var providers map[string]Provider

func init() {
	// extensions to seek in IMAP server capabilities to identify remote provider
	providers = map[string]Provider{
		// as of april, 2018 (see https://developers.google.com/gmail/imap/imap-extensions)
		"X-GM-EXT-1": {
			Name:       "gmail",
			FetchItems: []imap.FetchItem{gmail_msgid, gmail_labels},
		},
	}
}

func imapLogin(rId *UserIdentity) (tlsConn *tls.Conn, imapClient *client.Client, provider Provider, err error) {
	log.Println("Connecting to server...")
	// Dial TLS directly to be able to dump tls connection state
	tlsConn, err = tls.Dial("tcp", rId.Infos["inserver"], nil)
	if err != nil {
		log.WithError(err).Error("[fetchMail] imapLogin failed to dial tls")
		return
	}
	imapClient, err = client.New(tlsConn)
	if err != nil {
		log.WithError(err).Error("[fetchMail] imapLogin failed to create IMAP client")
		return
	}
	log.Println("Connected")

	// identify provider' capabilities
	capabilities, _ := imapClient.Capability()
	provider = Provider{Capabilities: capabilities}
	for capability := range capabilities {
		if p, ok := providers[capability]; ok {
			provider.Name = p.Name
			provider.FetchItems = p.FetchItems
		}
	}

	// choose auth mechanism according to provider capabilities and identity's authtype
	authType, foundAuthType := rId.Infos["authtype"]
	if foundAuthType {
		switch authType {
		case Oauth1:
			err = errors.New("oauth1 mechanism not implemented")
			return
		case Oauth2:
			saslClient := sasl.NewXoauth2Client((*rId.Credentials)[users.CRED_USERNAME], (*rId.Credentials)[users.CRED_ACCESS_TOKEN])
			err = imapClient.Authenticate(saslClient)
			if err != nil {
				log.WithError(err).Errorf("[fetchMail] imapLogin failed to authenticate identity %s with proto Xoauth2", rId.Id)
				return
			}
		case LoginPassword:
			err = imapClient.Login((*rId.Credentials)["inusername"], (*rId.Credentials)["inpassword"])
			if err != nil {
				log.WithError(err).Errorf("[fetchMail] imapLogin failed to login IMAP for user %s", rId.UserId)
				return
			}
		default:
			err = fmt.Errorf("unknown auth mechanism : <%s>", authType)
			return
		}
	} else {
		// fallback by trying default LoginPassword mechanism
		err = imapClient.Login((*rId.Credentials)["inusername"], (*rId.Credentials)["inpassword"])
		if err != nil {
			log.WithError(err).Error("[fetchMail] imapLogin failed to login IMAP")
			return
		}
	}

	log.Println("Logged in")
	return
}

// syncMailbox will check uidvalidity and fetch only new messages since last sync state saved in RemoteIdentity.
// If no previous state found in RemoteIdentity or uidvalidity has changed, syncMailbox will do a full fetch instead.
func syncMailbox(ibox *imapBox, imapClient *client.Client, provider Provider, ch chan *imap.Message) (err error) {

	mbox, err := imapClient.Select(ibox.name, false)
	if err != nil {
		log.WithError(err).Errorf("[syncMailbox] failed to select mailbox <%s>", ibox.name)
		close(ch)
		return
	}
	var from, to uint32
	if ibox.lastSync.IsZero() {
		// first sync, blindly fetch all messages
		from, to = 1, 0
		(*ibox).uidValidity = mbox.UidValidity
	} else {
		// check mailbox UIDVALIDITY
		if ibox.uidValidity != mbox.UidValidity {
			// TODO
			// MUST empty the local cache of that mailbox and resync mailbox
			log.Warnf("[syncMailbox] uidValidity has changed from %d to %d. Local mailbox should resync.", ibox.uidValidity, mbox.UidValidity)
			// for now, we blindly (re)fetch all messages
			from, to = 1, 0
			(*ibox).uidValidity = mbox.UidValidity
		} else {
			if ibox.lastSeenUid == 0 {
				from, to = 1, 0
			} else {
				from = ibox.lastSeenUid + 1
				to = 0
			}
		}
	}

	return fetch(imapClient, provider, from, to, ch)
}

// fetchMailbox retrieves all messages found within remote mailbox
// unaware of synchronization
func fetchMailbox(ibox *imapBox, imapClient *client.Client, provider Provider, ch chan *imap.Message) (err error) {

	mbox, err := imapClient.Select(ibox.name, true)
	if err != nil {
		log.WithError(err).Error("[fetchMailbox] failed to select INBOX")
		return
	}

	from := uint32(1)
	to := mbox.UidNext

	err = fetch(imapClient, provider, from, to, ch)
	if err != nil {
		log.WithError(err).Error("[fetchMailbox] failed")
	}
	return err
}

// MashalImap build RFC5322 mail from imap.Message,
// adds custom `X-Fetched` headers,
// returns an Email suitable to send to our email lda.
func MarshalImap(message *imap.Message, xHeaders ImapFetcherHeaders) (mail *Email, err error) {

	var mailBuff bytes.Buffer

	for k, v := range xHeaders {
		mailBuff.WriteString(k + ": " + v + "\r")
	}

	if len(message.Body) == 1 { // should have only one body
		for _, body := range message.Body {
			_, err := mailBuff.ReadFrom(body)
			if err != nil {
				//TODO
			}
			// stop at first iteration because only one body
			break
		}
	}

	mail = &Email{
		Raw:     mailBuff,
		ImapUid: message.Uid,
	}
	return
}

// buildXheaders builds custom X-Fetched headers
// with provider specific information
func buildXheaders(tlsConn *tls.Conn, rId *UserIdentity, box *imapBox, message *imap.Message, provider Provider) (xHeaders ImapFetcherHeaders) {
	connState := tlsConn.ConnectionState()

	var proto string
	if provider.Capabilities["IMAP4rev1"] == true {
		proto = "with IMAP4rev1 protocol"
	}
	xHeaders = make(ImapFetcherHeaders)
	xHeaders["X-Fetched-Imap"] = fmt.Sprintf(`from %s ([%s])
        (using %s with cipher %s)
        by imap-fetcher (Caliopen) %s;
        %s`,
		rId.Infos["inserver"],
		tlsConn.RemoteAddr().String(),
		TlsVersions[connState.Version],
		TlsSuites[connState.CipherSuite],
		proto,
		time.Now().Format(time.RFC1123Z))

	xHeaders["X-Fetched-Imap-Account"] = rId.DisplayName
	xHeaders["X-Fetched-Imap-Box"] = base64.StdEncoding.EncodeToString([]byte(box.name))
	xHeaders["X-Fetched-Imap-For"] = rId.UserId.String()
	xHeaders["X-Fetched-Imap-Uid"] = strconv.Itoa(int(message.Uid))
	if len(message.Flags) > 0 {
		xHeaders["X-Fetched-Imap-Flags"] = base64.StdEncoding.EncodeToString([]byte(strings.Join(message.Flags, "\r\n")))
	}
	switch provider.Name {
	case "gmail":
		xHeaders["X-Fetched-"+gmail_msgid] = message.Items[gmail_msgid].(string)
		gLabels := strings.Builder{}
		for i, label := range message.Items[gmail_labels].([]interface{}) {
			if i == 0 {
				gLabels.WriteString(label.(string))
			} else {
				gLabels.WriteString("\r\n" + label.(string))
			}
		}
		if gLabels.Len() > 0 {
			xHeaders["X-Fetched-"+gmail_labels] = base64.StdEncoding.EncodeToString([]byte(gLabels.String()))
		}

	}
	return
}

// from and to must be uid
// zero values will be replaced by * wildcard
func fetch(imapClient *client.Client, provider Provider, from, to uint32, ch chan *imap.Message) error {

	if from != 0 && to != 0 && from > to {
		close(ch)
		return fmt.Errorf("[fetch] 'to' param is lower than 'from'")
	}

	if from != 0 && from == to {
		log.Info("nothing to fetch")
		close(ch)
		return nil
	}
	seqset := new(imap.SeqSet)
	seqset.AddRange(from, to)

	log.Info("beginning to fetch messages…")
	items := []imap.FetchItem{imap.FetchFlags, imap.FetchUid, "BODY.PEEK[]"}
	if len(provider.FetchItems) > 0 {
		items = append(items, provider.FetchItems...)
	}

	return imapClient.UidFetch(seqset, items, ch)
}

// uploadSentMessage uploads a RFC 5322 mail to relevent `sent` mailbox and flags it has seen
func uploadSentMessage(imapClient *client.Client, mail string, date time.Time) error {

	//1. list mailboxes to find which one is for `sent` messages
	var sentMbx string
	boxes := make(chan *imap.MailboxInfo)
	go func() {
		err := imapClient.List("", "*", boxes)

		if err != nil {
			// ensure channel is closed
			if _, ok := <-boxes; ok {
				close(boxes)
			}
		}
	}()
	var found bool
	for box := range boxes {
		if !found {
			for _, attr := range box.Attributes {
				if strings.Contains(attr, "Sent") {
					sentMbx = box.Name
					found = true
					break
				}
			}
			if sentMbx == "" {
				if strings.Contains(box.Name, "Sent") {
					sentMbx = box.Name
					found = true
				}
			}
		}
	}
	//name still missing, use standard rfc6154#2
	if sentMbx == "" {
		sentMbx = `\Sent`
	}

	//2. append mail to mailbox
	return imapClient.Append(sentMbx, []string{imap.SeenFlag}, date, bytes.NewBufferString(mail))
}
