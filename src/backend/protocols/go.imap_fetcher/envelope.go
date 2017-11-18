// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package caliopen_smtp

import (
	"crypto/tls"
	"fmt"
	"strings"
	"time"
)

// Envelope holds a message
type Envelope struct {
	Sender     string
	Recipients []string
	Data       []byte
}

// AddReceivedLine prepends a Received header to the Data
func (env *Envelope) AddReceivedLine(peer Peer) {

	tlsDetails := ""

	tlsVersions := map[uint16]string{
		tls.VersionSSL30: "SSL3.0",
		tls.VersionTLS10: "TLS1.0",
		tls.VersionTLS11: "TLS1.1",
		tls.VersionTLS12: "TLS1.2",
	}

	if peer.TLS != nil {
		tlsDetails = fmt.Sprintf(
			"\r\n\t(version=%s cipher=0x%x);",
			tlsVersions[peer.TLS.Version],
			peer.TLS.CipherSuite,
		)
	}

	line := wrap([]byte(fmt.Sprintf(
		"Received: from %s [%s] by %s with %s;%s\r\n\t%s\r\n",
		peer.HeloName,
		strings.Split(peer.Addr.String(), ":")[0],
		peer.ServerName,
		peer.Protocol,
		tlsDetails,
		time.Now().Format("Mon Jan 2 15:04:05 -0700 2006"),
	)))

	env.Data = append(env.Data, line...)

	// Move the new Received line up front

	copy(env.Data[len(line):], env.Data[0:len(env.Data)-len(line)])
	copy(env.Data, line)

}

// Wrap a byte slice paragraph for use in SMTP header
func wrap(sl []byte) []byte {
	length := 0
	for i := 0; i < len(sl); i++ {
		if length > 76 && sl[i] == ' ' {
			sl = append(sl, 0, 0)
			copy(sl[i+2:], sl[i:])
			sl[i] = '\r'
			sl[i+1] = '\n'
			sl[i+2] = '\t'
			i += 2
			length = 0
		}
		if sl[i] == '\n' {
			length = 0
		}
		length++
	}
	return sl
}
