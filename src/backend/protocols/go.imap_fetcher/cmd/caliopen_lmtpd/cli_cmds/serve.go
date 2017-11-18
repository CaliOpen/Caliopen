package cmd

import (
	"os"
	"bytes"
	"errors"
	"syscall"
	"os/signal"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/nats-io/go-nats"
	log "github.com/Sirupsen/logrus"
	cimap "github.com/CaliOpen/Caliopen/src/backend/protocols/go.imap_fetcher"
)

var (
	configPath    string
	configFile    string
	signalChannel chan os.Signal // for trapping SIG_HUP
	cmdConfig     cimap.IMAPConfig

	serveCmd = &cobra.Command{
		Use:   "serve",
		Short: "Start the caliopen LMTP server",
		Run:   serve,
	}
)

func init() {
	serveCmd.PersistentFlags().StringVarP(&configFile, "config", "c",
		"caliopen-go-lmtp_dev", "Name of the configuration file, without extension. (YAML, TOML, JSON… allowed)")

	RootCmd.AddCommand(serveCmd)
	signalChannel = make(chan os.Signal, 1)
}

func sigHandler() {
	// handle SIGHUP for reloading the configuration while running
	signal.Notify(signalChannel, syscall.SIGHUP, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGINT, syscall.SIGKILL)

	for sig := range signalChannel {

		if sig == syscall.SIGHUP {
			err := readConfig(&cmdConfig)
			if err != nil {
				log.WithError(err).Error("Error while ReadConfig (reload)")
			} else {
				log.Info("Configuration is reloaded")
			}
			// TODO: reinitialize
		} else if sig == syscall.SIGTERM || sig == syscall.SIGQUIT || sig == syscall.SIGINT {
			log.Infof("Shutdown signal caught")
			cimap.ShutdownServer()
			log.Infof("Shutdown completed, exiting.")
			os.Exit(0)
		} else {
			os.Exit(0)
		}
	}
}

func serve(cmd *cobra.Command, args []string) {

	err := readConfig(&cmdConfig)
	if err != nil {
		log.WithError(err).Fatal("Error while reading config")
	}

	err = cimap.InitializeServer(cimap.IMAPConfig(cmdConfig))
	if err != nil {
		log.WithError(err).Fatal("Failed to init LMTP server")
	}
	go cimap.StartServer()
	lda := new(cimap.Lda)
	err = lda.Initialize(cmdConfig)

	startAgent(lda)

	//ri := GetRemoteIdentities(user.User_id)       // Aucune idée d'où provient le user

	var str bytes.Buffer
	list := []string{ri.infos["server"], ".", ri.infos["port"]}
	for _, l := range list {
		str.WriteString(l)
	}

	cimap.FetchRawMessage(lda, user.User_id, str.String(), ri.identifier, ri.infos["password"])
	sigHandler()
}

func startAgent(lda *(cimap.Lda)) error {

	var e error
	lda.Broker.Config = lda.Config.LDAConfig
	lda.Broker.NatsConn, e = nats.Connect(lda.Broker.Config.NatsURL)
	if e != nil {
		log.WithError(e)
		return e
	}
	//TODO: error handling
	return nil
}

// ReadConfig which should be called at startup, or when a SIG_HUP is caught
func readConfig(config *cimap.IMAPConfig) error {
	// load in the main config. Reading from YAML, TOML, JSON, HCL and Java properties config files

	v := viper.New()
	v.SetConfigName(configFile)                           // name of config file (without extension)
	v.AddConfigPath(configPath)                           // path to look for the config file in
	v.AddConfigPath("$CALIOPENROOT/src/backend/configs/") // call multiple times to add many search paths
	v.AddConfigPath(".")                                  // optionally look for config in the working directory

	err := v.ReadInConfig() // Find and read the config file*/
	if err != nil {
		log.WithError(err).Infof("Could not read main config file <%s>.", configFile)
		return err
	}
	err = v.Unmarshal(config)
	if err != nil {
		log.WithError(err).Infof("Could not parse config file: <%s>", configFile)
		return err
	}

	if len(config.AppConfig.AllowedHosts) == 0 {
		return errors.New("Empty `allowed_hosts` is not allowed")
	}
	config.AppConfig.AppVersion = __version__
	config.LDAConfig.AppVersion = config.AppConfig.AppVersion
	config.LDAConfig.PrimaryMailHost = config.AppConfig.PrimaryMailHost
	return nil
}
