// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// IMAP server to handle in/out emails from/to MTAs

package caliopen_smtp

import (
	"os/exec"
	"strconv"
	"strings"
	log "github.com/Sirupsen/logrus"
	broker "github.com/CaliOpen/Caliopen/src/backend/brokers/go.emails"
)

//Local Delivery Agent, in charge of IO between IMAP server and our email broker
type Lda struct {
	Config           IMAPConfig
	Broker           *broker.EmailBroker
	brokerConnectors broker.EmailBrokerConnectors
	inboundListener  *Server
	outboundListener *submitter
}

func (lda *Lda) Initialize(config IMAPConfig) (err error) {
	lda.Config = config
	lda.Broker, lda.brokerConnectors, err = broker.Initialize(config.LDAConfig)
	return err
}

func (lda *Lda) start() (err error) {

	// Check that max clients is not greater than system open file limit.
	fileLimit := getFileLimit()
	if fileLimit > 0 {
		maxClients := 0
		for _, s := range lda.Config.AppConfig.Servers {
			maxClients += s.MaxClients
		}
		if maxClients > fileLimit {
			log.Fatalf("Combined max clients for all servers (%d) is greater than open file limit (%d). "+
				"Please increase your open file limit or decrease max clients.", maxClients, fileLimit)
		}
	}

	// launch outbound chan listener
	lda.outboundListener, err = lda.newSubmitter()
	if err != nil {
		log.Warn("LDA submitter initialization failed")
	}
	go func() {
		lda.runSubmitterAgent()
	}()

	return
}

func (lda *Lda) shutdown() error {
	lda.Broker.ShutDown()
	return nil
}

func getFileLimit() int {
	cmd := exec.Command("ulimit", "-n")
	out, err := cmd.Output()
	if err != nil {
		return -1
	}

	limit, err := strconv.Atoi(strings.TrimSpace(string(out)))
	if err != nil {
		return -1
	}

	return limit
}
