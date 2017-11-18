// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package caliopen_smtp

import (
	log "github.com/Sirupsen/logrus"
)

var (
	lda    *Lda
	daemon *Server
)

// load configuration into package's vars above
func InitializeServer(config IMAPConfig) (err error) {
	lda = new(Lda)
	daemon = new(Server)
	log.Println(lda.Initialize(config))
	err = lda.Initialize(config)
	if err != nil {
		return
	}
	err = daemon.initialize(config)
	return
}

// listen & serve
func StartServer() {
	err := lda.start()
	if err != nil {
		log.WithError(err).Fatal("LDA failed to start")
	} else {
		log.Infof("Caliopen lda started")
	}
	err = daemon.start()
	if err != nil {
		lda.shutdown()
		log.WithError(err).Fatal("imap failed to start")
	}
	log.Infof("Caliopen imap started")

}

func ShutdownServer() (err error) {
	err = lda.shutdown()
	if err != nil {
		log.WithError(err).Warn("Error when shutting down LDA")
	}
	err = daemon.shutdown()
	if err != nil {
		log.WithError(err).Warn("Error when shutting down imap")
	}
	return
}
