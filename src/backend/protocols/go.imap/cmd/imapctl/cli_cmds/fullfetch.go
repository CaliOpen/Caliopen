/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package cmd

import (
	"encoding/json"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/store/cassandra"
	"github.com/Sirupsen/logrus"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/nats-io/go-nats"
	"github.com/spf13/cobra"
)

var (
	fullFetchCmd = &cobra.Command{
		Use:   "fullfetch",
		Short: "blindly imports all mails from a remote IMAP mailbox into user's account.",
		Run:   fullFetch,
	}
)

func init() {
	fullFetchCmd.Flags().StringVarP(&id.UserName, "username", "u", "", "user_name account in which mails will be imported (required)")
	fullFetchCmd.Flags().StringVarP(&id.Server, "server", "s", "", "remote hostname[:port] IMAP server address (required)")
	fullFetchCmd.Flags().StringVarP(&id.Mailbox, "mailbox", "m", "INBOX", "IMAP mailbox name to fetch mail from, case sensitive")
	fullFetchCmd.Flags().StringVarP(&id.Login, "login", "l", "", "IMAP login credential (required)")
	fullFetchCmd.Flags().StringVarP(&id.Password, "pass", "p", "", "IMAP password credential (required)")
	fullFetchCmd.MarkFlagRequired("username")
	fullFetchCmd.MarkFlagRequired("server")
	fullFetchCmd.MarkFlagRequired("login")
	fullFetchCmd.MarkFlagRequired("pass")
	RootCmd.AddCommand(fullFetchCmd)
}

// fullFetch
func fullFetch(cmd *cobra.Command, args []string) {
	var us backends.UserNameStorage
	var cb *store.CassandraBackend
	var err error
	switch cmdConfig.StoreName {
	case "cassandra":
		c := store.CassandraConfig{
			Hosts:       cmdConfig.StoreConfig.Hosts,
			Keyspace:    cmdConfig.StoreConfig.Keyspace,
			Consistency: gocql.Consistency(cmdConfig.StoreConfig.Consistency),
			SizeLimit:   cmdConfig.StoreConfig.SizeLimit,
		}

		cb, err = store.InitializeCassandraBackend(c)
		if err != nil {
			log.WithError(err).Fatalf("[addRemote] initalization of %s backend failed", cmdConfig.StoreName)
		}

	}
	us = backends.UserNameStorage(cb)

	user, e := us.UserByUsername(id.UserName)
	if e != nil {
		log.WithError(e).Fatalf("[addRemote] failed to retrieve user name <%s>", id.UserName)
	}
	id.UserId = user.UserId
	nc, err := nats.Connect(cmdConfig.NatsUrl)
	if err != nil {
		logrus.WithError(err).Fatal("nats connect failed")
	}
	defer nc.Close()

	msg, err := json.Marshal(IMAPfetchOrder{
		Order:    "fullfetch",
		UserId:   id.UserId.String(),
		Server:   id.Server,
		Mailbox:  id.Mailbox,
		Login:    id.Login,
		Password: id.Password,
	})
	if err != nil {
		logrus.WithError(err).Fatal("unable to marshal natsOrder")
	}

	nc.Publish(cmdConfig.NatsTopic, msg)
	nc.Flush()

	if err := nc.LastError(); err != nil {
		logrus.WithError(err).Fatal("nats publish failed")
	}

	logrus.Infof("ordering to fetch all mails from %s for user %s", id.Login, id.UserId)
}
