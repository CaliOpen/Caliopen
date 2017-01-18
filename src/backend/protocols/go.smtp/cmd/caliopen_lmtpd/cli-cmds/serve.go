package cmd

import (
	"errors"
	"fmt"
	csmtp "github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp"
	log "github.com/Sirupsen/logrus"
	"github.com/flashmob/go-guerrilla"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"os"
	"os/signal"
	"syscall"
)

var (
	configPath    string
	configFile    string
	pidFile       string
	signalChannel chan os.Signal // for trapping SIG_HUP
	cmdConfig     CmdConfig

	serveCmd = &cobra.Command{
		Use:   "serve",
		Short: "start the caliopen LMTP server",
		Run:   serve,
	}
)

func init() {
	serveCmd.PersistentFlags().StringVarP(&configFile, "config", "c",
		"caliopen-go-lmtp_dev", "Name of the configuration file, without extension. (YAML, TOML, JSON… allowed)")
	serveCmd.PersistentFlags().StringVarP(&configPath, "configpath", "",
		"../../../../configs/", "Main config file path.")
	serveCmd.PersistentFlags().StringVarP(&pidFile, "pid-file", "p",
		"/var/run/caliopen_lmtpd.pid", "Path to the pid file")

	RootCmd.AddCommand(serveCmd)
	signalChannel = make(chan os.Signal, 1)
	cmdConfig = CmdConfig{}
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
				log.Infof("Configuration is reloaded at %s", guerrilla.ConfigLoadTime)
			}
			// TODO: reinitialize
		} else if sig == syscall.SIGTERM || sig == syscall.SIGQUIT || sig == syscall.SIGINT {
			log.Infof("Shutdown signal caught")
			csmtp.ShutdownLda()
			csmtp.ShutdownServer()
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
	// Write out our PID
	if len(pidFile) > 0 {
		if f, err := os.Create(pidFile); err == nil {
			defer f.Close()
			if _, err := f.WriteString(fmt.Sprintf("%d", os.Getpid())); err == nil {
				f.Sync()
			} else {
				log.WithError(err).Fatalf("Error while writing pidFile (%s)", pidFile)
			}
		} else {
			log.WithError(err).Fatalf("Error while creating pidFile (%s)", pidFile)
		}
	}

	err = csmtp.InitializeServer(csmtp.SMTPConfig(cmdConfig))
	if err != nil {
		log.WithError(err).Fatal("Failed to init LMTP server")
	}
	go csmtp.StartServer()

	sigHandler()
}

type CmdConfig csmtp.SMTPConfig

// ReadConfig which should be called at startup, or when a SIG_HUP is caught
func readConfig(config *CmdConfig) error {
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

	if len(config.AllowedHosts) == 0 {
		return errors.New("Empty `allowed_hosts` is not allowed")
	}

	return nil
}
