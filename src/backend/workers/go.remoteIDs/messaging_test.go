package go_remoteIDs

import (
	"fmt"
	"github.com/nats-io/gnatsd/server"
	"strconv"
	"testing"
	"time"
)

const (
	natsUrl  = "0.0.0.0"
	natsPort = 8444
)

func initMqHandlerTest() (*MqHandler, error) {
	// starting an embedded nats server
	s, err := server.NewServer(&server.Options{
		Host:     natsUrl,
		Port:     natsPort,
		HTTPPort: -1,
		Cluster:  server.ClusterOpts{Port: -1},
		NoLog:    true,
		NoSigs:   true,
		Debug:    false,
		Trace:    false,
	})
	if err != nil || s == nil {
		panic(fmt.Sprintf("No NATS Server object returned: %v", err))
	}
	go s.Start()
	// Wait for accept loop(s) to be started
	if !s.ReadyForConnections(10 * time.Second) {
		panic("Unable to start NATS Server in Go Routine")
	}

	poller.Config = PollerConfig{
		NatsUrl: "nats://" + natsUrl + ":" + strconv.Itoa(natsPort),
		NatsTopics: map[string]string{
			"id_cache": "idCache",
			"imap":     "imapJobs",
			"twitter":  "twitterJobs",
		},
	}

	return InitMqHandler()
}

func TestInitMqHandler(t *testing.T) {
	mqh, err := initMqHandlerTest()
	if err != nil {
		t.Error(err)
		return
	}
	if mqh == nil {
		t.Error("no mqh returned")
		return
	}
	if mqh.natsConn == nil {
		t.Error("nats conn is nil")
	}
	if mqh.natsSubIdentities == nil {
		t.Error("nats identities subscription is nil")
	}
	if mqh.natsSubTwitter == nil {
		t.Error("nats Twitter subscription is nil")
	}
	if mqh.natsSubImap == nil {
		t.Error("nats imap subscription is nil")
	}
}

func TestMqHandler_natsIdentitiesHandler(t *testing.T) {

}
