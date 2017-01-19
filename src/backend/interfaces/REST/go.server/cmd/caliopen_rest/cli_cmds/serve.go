// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

// APIs() launches the Caliopen application's interfaces processes

package cmd

import (
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server"
	log "github.com/Sirupsen/logrus"
	"github.com/flashmob/go-guerrilla"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"os"
	"os/signal"
	"syscall"
)

var (
	withProxy      bool
	configFileName string
	configPath     string
	pidFile        string
	cmdConfig      CmdConfig
	serveCmd       = &cobra.Command{
		Use:   "serve",
		Short: "start the caliopen REST HTTP API server (& proxy)",
		Run:   API,
	}

	signalChannel = make(chan os.Signal, 1) // for trapping SIG_HUP
)

func init() {
	cobra.OnInitialize()
	serveCmd.PersistentFlags().StringVarP(&configFileName, "configfile", "c",
		"caliopen-go-api_dev", "Name of the configuration file, without extension. (YAML, TOML, JSON… allowed)")
	serveCmd.PersistentFlags().StringVarP(&configPath, "configpath", "",
		"../../../../../configs/", "API config file path.")
	serveCmd.PersistentFlags().StringVarP(&pidFile, "pid-file", "p",
		"/var/run/caliopen_rest.pid", "Path to the pid file")
	serveCmd.PersistentFlags().BoolVarP(&withProxy, "proxy", "", true, "Start HTTP proxy for routing to both GO & Python services")
	serveCmd.PersistentPreRun = func(cmd *cobra.Command, args []string) {
		if verbose {
			log.SetLevel(log.DebugLevel)
		} else {
			log.SetLevel(log.InfoLevel)
		}
	}
	RootCmd.AddCommand(serveCmd)

	signalChannel = make(chan os.Signal, 1)
}

func sigHandler() {
	// handle SIGHUP for reloading the configuration while running
	signal.Notify(signalChannel, syscall.SIGHUP, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGINT, syscall.SIGKILL)

	for sig := range signalChannel {

		if sig == syscall.SIGHUP {
			err := readConfig(false)
			if err != nil {
				log.WithError(err).Error("Error while ReadConfig (reload)")
			} else {
				log.Infof("Configuration is reloaded at %s", guerrilla.ConfigLoadTime)
			}
			// TODO: reinitialize
		} else if sig == syscall.SIGTERM || sig == syscall.SIGQUIT || sig == syscall.SIGINT {
			log.Info("Shutdown signal caught")

			if withProxy {

			}

			//app.Shutdown()
			log.Infof("Shutdown completed, exiting.")
			os.Exit(0)
		} else {
			os.Exit(0)
		}
	}
}

func API(cmd *cobra.Command, args []string) {
	err := readConfig(false)

	if withProxy {
		// start HTTP reverse proxy
		go rest_api.StartProxy(cmdConfig.ProxyConfig)
	}

	err = rest_api.InitializeServer(cmdConfig.APIConfig)
	if err != nil {
		log.Fatal(err)
	}
	go rest_api.StartServer()

	sigHandler()
}

// Read and parse api configuration file
func readConfig(readAll bool) error {
	// load in the main config. Reading from YAML, TOML, JSON, HCL and Java properties config files

	apiViper := viper.New()
	apiViper.SetConfigName(configFileName)
	apiViper.AddConfigPath(configPath)
	apiViper.AddConfigPath("$CALIOPENROOT/src/backend/configs/")
	apiViper.AddConfigPath(".")

	// load APIs config
	err := apiViper.ReadInConfig()
	if err != nil {
		log.WithError(err).Infof("Could not read api config file <%s>.", configFileName)
		return err
	}

	err = apiViper.Unmarshal(&cmdConfig)
	if err != nil {
		log.WithError(err).Infof("Could not parse api config file: <%s>", configFileName)
		return err
	}
	return nil
}

type CmdConfig struct {
	rest_api.APIConfig
	rest_api.ProxyConfig
}
