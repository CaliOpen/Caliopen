/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package cmd

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/store/cassandra"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/satori/go.uuid"
	"github.com/spf13/cobra"
)

var (
	id           remoteId
	addRemoteCmd = &cobra.Command{
		Use:   "addremote",
		Short: "add an IMAP remote identity for specified user",
		Run:   addRemote,
	}
)

type remoteId struct {
	DisplayName  string
	Login        string
	Mailbox      string
	Password     string
	PollInterval string
	RemoteId     string
	Server       string
	UserId       UUID
	UserName     string
}

func init() {
	//mandatory
	addRemoteCmd.Flags().StringVarP(&id.UserName, "username", "u", "", "user name account in which mails will be imported (required)")
	addRemoteCmd.Flags().StringVarP(&id.Server, "server", "s", "", "remote hostname[:port] IMAP server address (required)")
	addRemoteCmd.Flags().StringVarP(&id.Login, "login", "l", "", "IMAP login credential (required)")
	//optional
	addRemoteCmd.Flags().StringVarP(&id.Password, "pass", "p", "", "IMAP password credential")
	addRemoteCmd.Flags().StringVarP(&id.Mailbox, "mailbox", "m", "INBOX", "IMAP mailbox name to fetch mail from (case sensitive, default to 'INBOX'")
	addRemoteCmd.Flags().StringVarP(&id.DisplayName, "display", "d", "", "display name for remote identity (default to login)")
	addRemoteCmd.MarkFlagRequired("username")
	addRemoteCmd.MarkFlagRequired("server")
	addRemoteCmd.MarkFlagRequired("login")
	RootCmd.AddCommand(addRemoteCmd)
}

func addRemote(cmd *cobra.Command, args []string) {
	var is backends.IdentityStorage
	var us backends.UserNameStorage
	var cb *store.CassandraBackend
	var rId RemoteIdentity
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
	is = backends.IdentityStorage(cb)
	us = backends.UserNameStorage(cb)

	user, e := us.UserByUsername(id.UserName)
	if e != nil {
		log.WithError(e).Fatalf("[addRemote] failed to retrieve user name <%s>", id.UserName)
	}
	id.UserId = user.UserId
	if id.DisplayName == "" {
		id.DisplayName = id.Login
	}
	rId = RemoteIdentity{
		DisplayName: id.DisplayName,
		Status:      "active",
		Type:        "imap",
		UserId:      id.UserId,
	}
	rId.RemoteId.UnmarshalBinary(uuid.NewV4().Bytes())
	rId.SetDefaults()
	rId.Infos["server"] = id.Server
	rId.Credentials["password"] = id.Password
	rId.Credentials["username"] = id.Login

	err = is.CreateRemoteIdentity(&rId)
	if err != nil {
		log.WithError(err).Warn("[addRemote] storage failed to store remote identity")
	} else {
		log.Infof("OK, new remote identity added with id %s ! Bye.", rId.RemoteId.String())
	}
}
