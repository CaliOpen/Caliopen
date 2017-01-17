// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// SMTP server to handle in/out emails from/to MTAs

package caliopen_smtp

import (
	log "github.com/Sirupsen/logrus"
	"github.com/flashmob/go-guerrilla"
	"os/exec"
	"strconv"
	"strings"
)

var (
	server *SMTPServer
)

func InitializeServer(config SMTPConfig) error {
	server = new(SMTPServer)
	return server.initialize(config)
}

func (server *SMTPServer) initialize(config SMTPConfig) error {
	server.config = config
	return nil
}

func StartServer() error {
	return server.start()
}

func (server *SMTPServer) start() error {

	// Check that max clients is not greater than system open file limit.
	fileLimit := getFileLimit()

	if fileLimit > 0 {
		maxClients := 0
		for _, s := range server.config.Servers {
			maxClients += s.MaxClients
		}
		if maxClients > fileLimit {
			log.Fatalf("Combined max clients for all servers (%d) is greater than open file limit (%d). "+
				"Please increase your open file limit or decrease max clients.", maxClients, fileLimit)
		}
	}

	// launch & register LDA service
	err := server.InitializeLda(server.config.LDAConfig)
	if err != nil {
		log.WithError(err).Fatal("failed to initialize LDA")
	}

	err = server.lda.start()
	if err != nil {
		log.WithError(err).Fatal("failed to start LDA")
	}

	var b guerrilla.Backend
	b = guerrilla.Backend(server.lda) // type convertion. guerrilla.Backend is an interface.
	gConfig := guerrilla.AppConfig{
		AllowedHosts: server.config.AppConfig.AllowedHosts,
	}
	for _, server := range server.config.AppConfig.Servers {
		gServer := guerrilla.ServerConfig{
			IsEnabled: server.IsEnabled,
			Hostname: server.Hostname,
			AllowedHosts: server.AllowedHosts,
			MaxSize: server.MaxSize,
			PrivateKeyFile: server.PrivateKeyFile,
			PublicKeyFile: server.PublicKeyFile,
			Timeout: server.Timeout,
			ListenInterface: server.ListenInterface,
			StartTLSOn: server.StartTLSOn,
			TLSAlwaysOn: server.TLSAlwaysOn,
			MaxClients: server.MaxClients,
		}
		     gConfig.Servers = append(gConfig.Servers, gServer)
	}
	app := guerrilla.New(&gConfig, &b)

	// launch listener
	go func() {
		err := app.Start()
		if len(err) != 0 {
			log.Infof("Error(s) at startup : ", err)
		}
	}()
	return nil
}

func ShutdownServer() error {
	return server.shutdown()
}

func (server *SMTPServer) shutdown() error {
	return nil
}

type SMTPServer struct {
	config SMTPConfig
	lda    *CaliopenLDA
}

type SMTPConfig struct {
	AppConfig
	LDAConfig
}

// AppConfig is a clone of guerrilla AppConfig with relevant tagstrings
type AppConfig struct {
	Servers      []ServerConfig `mapstructure:"servers"`
	AllowedHosts []string       `mapstructure:"allowed_hosts"`
}

// ServerConfig specifies config options for a single server
type ServerConfig struct {
	IsEnabled       bool     `mapstructure:"is_enabled"`
	Hostname        string   `mapstructure:"host_name"`
	AllowedHosts    []string `mapstructure:"allowed_hosts"`
	MaxSize         int64    `mapstructure:"max_size"`
	PrivateKeyFile  string   `mapstructure:"private_key_file"`
	PublicKeyFile   string   `mapstructure:"public_key_file"`
	Timeout         int      `mapstructure:"timeout"`
	ListenInterface string   `mapstructure:"listen_interface"`
	StartTLSOn      bool     `mapstructure:"start_tls_on,omitempty"`
	TLSAlwaysOn     bool     `mapstructure:"tls_always_on,omitempty"`
	MaxClients      int      `mapstructure:"max_clients"`
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
