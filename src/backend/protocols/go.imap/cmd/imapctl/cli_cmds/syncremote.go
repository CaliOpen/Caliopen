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
	syncRemoteCmd = &cobra.Command{
		Use:   "syncremote",
		Short: "sync remote mailbox for provided remote identity",
		Run:   syncRemote,
	}
)

func init() {
	syncRemoteCmd.Flags().StringVarP(&id.UserName, "username", "u", "", "Caliopen username account to which mails will be delivered (required)")
	syncRemoteCmd.Flags().StringVarP(&id.RemoteId, "remoteid", "r", "", "remote identity's uuid (required)")
	syncRemoteCmd.Flags().StringVarP(&id.Password, "pass", "p", "", "IMAP password (if not stored in db)")
	syncRemoteCmd.MarkFlagRequired("userid")
	syncRemoteCmd.MarkFlagRequired("remoteid")
	RootCmd.AddCommand(syncRemoteCmd)
}

func syncRemote(cmd *cobra.Command, args []string) {

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

	nc, err := nats.Connect(cmdConfig.NatsUrl)
	if err != nil {
		logrus.WithError(err).Fatal("nats connect failed")
	}
	defer nc.Close()

	msg, err := json.Marshal(IMAPfetchOrder{
		Login:    id.Login,
		Mailbox:  id.Mailbox,
		Order:    "sync",
		Password: id.Password,
		RemoteId: id.RemoteId,
		Server:   id.Server,
		UserId:   user.UserId.String(),
	})
	if err != nil {
		logrus.WithError(err).Fatal("unable to marshal natsOrder")
	}

	nc.Publish(cmdConfig.NatsTopic, msg)
	nc.Flush()

	if err := nc.LastError(); err != nil {
		logrus.WithError(err).Fatal("nats publish failed")
	}

	logrus.Infof("ordering to sync mailbox from %s for user %s", id.DisplayName, user.UserId.String())
}
