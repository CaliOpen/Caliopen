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
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
	"strconv"
	"strings"
	"time"
)

// ImapFetcherHeaders are headers added to emails fetched from remote IMAP
type ImapFetcherHeaders map[string]string

type Provider struct {
	name         string           // gmail, yahoo, etc.
	capabilities map[string]bool  // capabilites sent back by provider at connection time
	fetchItems   []imap.FetchItem // provider specific items that we want to fetch
}

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
			name:       "gmail",
			fetchItems: []imap.FetchItem{gmail_msgid, gmail_labels},
		},
	}
}

func imapLogin(rId *RemoteIdentity) (tlsConn *tls.Conn, imapClient *client.Client, provider Provider, err error) {
	log.Println("Connecting to server...")
	// Dial TLS directly to be able to dump tls connection state
	tlsConn, err = tls.Dial("tcp", rId.Infos["server"], nil)
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

	// identify provider
	capabilities, _ := imapClient.Capability()
	provider = Provider{capabilities: capabilities}
	for capability, _ := range capabilities {
		if p, ok := providers[capability]; ok {
			provider.name = p.name
			provider.fetchItems = p.fetchItems
		}
	}

	// Login
	if err = imapClient.Login(rId.Credentials["username"], rId.Credentials["password"]); err != nil {
		log.WithError(err).Error("[fetchMail] imapLogin failed to login IMAP")
		return
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
		ibox.uidValidity = mbox.UidValidity
	} else {
		// check mailbox UIDVALIDITY
		if ibox.uidValidity != mbox.UidValidity {
			// TODO
			// MUST empty the local cache of that mailbox and resync mailbox
			log.Warnf("[syncMailbox] uidValidity has changed from %d to %d. Local mailbox should resync.", ibox.uidValidity, mbox.UidValidity)
			// for now, we blindly (re)fetch all messages
			from, to = 1, 0
			ibox.uidValidity = mbox.UidValidity
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
func buildXheaders(tlsConn *tls.Conn, imapClient *client.Client, rId *RemoteIdentity, box *imapBox, message *imap.Message, provider Provider) (xHeaders ImapFetcherHeaders) {
	connState := tlsConn.ConnectionState()

	var proto string
	if provider.capabilities["IMAP4rev1"] == true {
		proto = "with IMAP4rev1 protocol"
	}
	xHeaders = make(ImapFetcherHeaders)
	xHeaders["X-Fetched-Imap"] = fmt.Sprintf(`from %s ([%s])
        (using %s with cipher %s)
        by imap-fetcher (Caliopen) %s;
        %s`,
		rId.Infos["server"],
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
	switch provider.name {
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
	if len(provider.fetchItems) > 0 {
		items = append(items, provider.fetchItems...)
	}

	return imapClient.UidFetch(seqset, items, ch)
}
