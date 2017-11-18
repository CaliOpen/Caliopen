package caliopen_smtp

import (
	"fmt"
        "time"
	"errors"
	"encoding/json"
        tls "crypto/tls"
	"github.com/gocql/gocql"
	"github.com/emersion/go-imap"
	log "github.com/Sirupsen/logrus"
	"github.com/hashicorp/go-multierror"
	"github.com/emersion/go-imap/client"
	obj "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

const nats_message_tmpl = "{\"order\":\"%s\",\"user_id\": \"%s\", \"message_id\": \"%s\"}"

type (
        Info struct {
                Version         string
                CipherSuite     string
        }
)

var Version = map[int]string {
        768 : "VersionSSL30",   // 0x0300
        769 : "VersionTLS10",   // 0x0301
        770 : "VersionTLS11",   // 0x0302
        771 : "VersionTLS12",   // 0x0303
}

var CipherSuite = map[int]string {
	5 :     "TLS_RSA_WITH_RC4_128_SHA",                // 0x0005
	10 :    "TLS_RSA_WITH_3DES_EDE_CBC_SHA",           // 0x000a
	47 :    "TLS_RSA_WITH_AES_128_CBC_SHA",            // 0x002f
	53 :    "TLS_RSA_WITH_AES_256_CBC_SHA",            // 0x0035
	60 :    "TLS_RSA_WITH_AES_128_CBC_SHA256",         // 0x003c
	156 :   "TLS_RSA_WITH_AES_128_GCM_SHA256",         // 0x009c
	157 :   "TLS_RSA_WITH_AES_256_GCM_SHA384",         // 0x009d
	49159 : "TLS_ECDHE_ECDSA_WITH_RC4_128_SHA",        // 0xc007
	49161 : "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA",    // 0xc009
	49162 : "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA",    // 0xc00a
	49169 : "TLS_ECDHE_RSA_WITH_RC4_128_SHA",          // 0xc011
	49170 : "TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA",     // 0xc012
	49171 : "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",      // 0xc013
	49172 : "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",      // 0xc014
	49187 : "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256", // 0xc023
	49191 : "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",   // 0xc027
	49199 : "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",   // 0xc02f
	49195 : "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256", // 0xc02b
	49200 : "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",   // 0xc030
	49196 : "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384", // 0xc02c
	52392 : "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305",    // 0xcca8
	52393 : "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305",  // 0xcca9
	22016 : "TLS_FALLBACK_SCSV",                       // 0x5600
}

func DialTest(addr string, tlsConfig *tls.Config) (info Info) {

	conn, err := tls.Dial("tcp", addr, tlsConfig)

	var version_tmp string
	var ciphersuite_tmp string

	if err != nil {
		return
	}

	c := conn.ConnectionState()
	for key := range Version {
		if int(c.Version) == key {
			version_tmp = Version[int(c.Version)]
		}
	}

	for key := range CipherSuite {
		if int(c.CipherSuite) == key {
			ciphersuite_tmp = CipherSuite[int(c.CipherSuite)]
		}
	}

	info = Info{
		Version : version_tmp,
		CipherSuite : ciphersuite_tmp,
	}

	return info
}

func FetchRawMessage(lda *Lda, user_id string, addr string, add string, password string) () {

	c, err := client.DialTLS(addr, nil)

	info := DialTest(addr, nil)

	if err != nil {
		log.Fatal(err)
	}

	defer c.Logout()

	if err := c.Login(add, password); err != nil {
		log.Fatal(err)
	}

	mailboxes := make(chan *imap.MailboxInfo, 10)
	done := make(chan error, 1)

	go func () {
		done <- c.List("", "*", mailboxes)
	}()

	if err := <-done; err != nil {
		log.Fatal(err)
	} 

	mbox, err := c.Select("INBOX", false)

	from := uint32(1)
	to := mbox.Messages

	seqset := new(imap.SeqSet)
	seqset.AddRange(from, to)

	messages := make(chan *imap.Message, 10)
	done = make(chan error, 1)
	go func() {
		done <- c.Fetch(seqset, []string{imap.EnvelopeMsgAttr}, messages)
	}()

	for msg := range messages {
		go func(*imap.Message) {
			protocol_tmp := "None"
			if c.IsTLS() {
				protocol_tmp = "TLS"
			} else {
				protocol_tmp = "SSL"
			}

			var raw_uuid gocql.UUID
			raw_uuid, err = gocql.RandomUUID()
			var msg_id obj.UUID
			msg_id.UnmarshalBinary(raw_uuid.Bytes())

			message_tmp := obj.RawMessage{
				Raw_msg_id : msg_id,
				Raw_Size : (uint64)(msg.Size),
				InternalDate : msg.InternalDate,
				Server : "IMAP",
				Protocol : protocol_tmp,
				VersionTLS : info.Version,
				CipherSuite : info.CipherSuite,
			}

			lda.Broker.Store.StoreRawMessage(message_tmp)

			natsMessage := fmt.Sprintf(nats_message_tmpl, "process_raw", user_id, message_tmp.Raw_msg_id.String())

			resp, err := lda.Broker.NatsConn.Request(lda.Broker.Config.InTopic, []byte(natsMessage), 500000*time.Millisecond)	// Problem with timeout

			var errs error
			if err != nil {
				if lda.Broker.NatsConn.LastError() != nil {
					log.WithError(lda.Broker.NatsConn.LastError()).Warnf("EmailBroker failed to publish inbound request on NATS for user %s", user_id)
					errs = multierror.Append(errs, err)
				} else {
					log.WithError(err).Warnf("EmailBroker failed to publish inbound request on NATS for user %s", user_id)
					errs = multierror.Append(errs, err)
				}
			} else {
				nats_ack := new(map[string]interface{})
				err := json.Unmarshal(resp.Data, &nats_ack)
				if err != nil {
					log.WithError(err).Warnf("EmailBroker failed to parse inbound ack on NATS for user %s", user_id)
					errs = multierror.Append(err)
					return
				}
				if err, ok := (*nats_ack)["error"]; ok {
					log.WithField("error", err.(string)).Warnf("EmailBroker failed to publish inbound request on NATS for user %s", user_id)
					errs = multierror.Append(errors.New(err.(string)))
					return
				}

				//nats delivery OK
				if lda.Broker.Config.LogReceivedMails {
					log.Infof("EmailBroker : NATS inbound request successfully handled for user %s : %s", user_id, (*nats_ack)["message"])
				}
			}
		} (msg)
	}
	return
}
