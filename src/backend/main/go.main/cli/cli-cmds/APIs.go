// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

// APIs() launches the Caliopen application's interfaces processes

package cmd

import (
	"bufio"
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server"
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/TCP/go.server"
	csmtp "github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp"
	log "github.com/Sirupsen/logrus"
	"github.com/flashmob/go-guerrilla"
	"github.com/hpcloud/tail"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
)

var (
	withSmtp    bool
	withPyramid bool
	withTcp     bool

	APIsCmd = &cobra.Command{
		Use:   "APIs",
		Short: "start the caliopen application's APIs servers",
		Run:   APIs,
	}

	signalChannel = make(chan os.Signal, 1) // for trapping SIG_HUP
)

func init() {
	APIsCmd.PersistentFlags().BoolVar(&withSmtp, "smtp", true, "Start the embedded smtp server")
	APIsCmd.PersistentFlags().BoolVar(&withPyramid, "pyramid", true, "Launch the python/pyramid API (pserve script)")
	APIsCmd.PersistentFlags().BoolVar(&withTcp, "tcp", true, "Start the REST TCP API")
	RootCmd.AddCommand(APIsCmd)
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

			if withPyramid {
				//pyramid shutdown
				log.Info("…shutdowning pymarid")
				pyPID, err := afero.ReadFile(AppsFS, "pyramid.pid")
				if err != nil {
					log.WithError(err).Info("unable to read pyramid.pid file. You may have to kill pserve process.")
				}
				exec.Command("kill", string(pyPID)).Run()
			}

			if withTcp {

			}

			if withSmtp {
				log.Info("…shutdowning smtp")
			}
			//app.Shutdown()
			log.Infof("Shutdown completed, exiting.")
			os.Exit(0)
		} else {
			os.Exit(0)
		}
	}
}

func APIs(cmd *cobra.Command, args []string) {
	err := readConfig(false)
	if err != nil {
		log.Fatal(err)
	}

	// start HTTP reverse proxy
	go rest_api.StartProxy()

	// start GO REST server
	//load API config
	v := viper.New()
	v.SetConfigName(cmdConfig.Apis.GoRESTconfigFile) // name of config file (without extension)
	v.AddConfigPath(cmdConfig.Apis.GoRESTconfigPath) // path to look for the config file in
	v.AddConfigPath(configPath)
	v.AddConfigPath("$CALIOPENROOT/src/backend/configs/") // call multiple times to add many search paths
	v.AddConfigPath(".")                                  // optionally look for config in the working directory

	err = v.ReadInConfig() // Find and read the config file*/
	if err != nil {
		log.WithError(err).Fatalf("Could not read main config file <%s>.", cmdConfig.Apis.GoRESTconfigFile)
	}
	apiConfig := rest_api.APIConfig{}
	err = v.Unmarshal(&apiConfig)
	if err != nil {
		log.WithError(err).Fatalf("Could not parse config file: <%s>", cmdConfig.Apis.GoRESTconfigFile)
	}

	err = rest_api.InitializeServer(apiConfig)
	if err != nil {
		log.Fatal(err)
	}
	go rest_api.StartServer()

	if withPyramid {
		// start Pyramid REST server
		go func() {
			//for now we launch 'pserve'.
			//we should launch pyramid as a WSGI endpoint and make use of our proxy.
			cmd := exec.Command("pserve",
				cmdConfig.Apis.PyRESTresolvedConfigPath,
				"start",
				"--reload",
			)
			//pserve will launch a subprocess
			pserveStdout, err := cmd.StdoutPipe()
			defer pserveStdout.Close()

			pyramidlog, err := tail.TailFile("pyramid.log", tail.Config{
				Follow:   true,
				Location: &tail.SeekInfo{0, 2},
				Logger:   tail.DiscardingLogger,
			})
			if err != nil {
				log.WithError(err).Info("unable to open pyramid log file")
			}

			err = cmd.Start()
			if err != nil {
				log.WithError(err).Info("unable to launch pserve")
			}
			s := bufio.NewScanner(pserveStdout)
			for s.Scan() {
				log.WithField("Log", s.Text()).Info("(PSERVE)")
			}
			err = cmd.Wait()

			if err != nil {
				log.WithError(err).Info("unable to start REST py.server")
			}

			for line := range pyramidlog.Lines {
				log.WithField("Log", line.Text).Info("(PYRAMID API)")
			}
		}()
	}

	if withTcp {
		// start TCP API server
		go tcp_api.StartServer()
	}

	if withSmtp {
		// embed smtp server
		//load smtp config
		v := viper.New()
		v.SetConfigName(cmdConfig.Smtp.SMTPconfigFile) // name of config file (without extension)
		v.AddConfigPath(cmdConfig.Smtp.SMTPconfigPath) // path to look for the config file in
		v.AddConfigPath(configPath)
		v.AddConfigPath("$CALIOPENROOT/src/backend/configs/") // call multiple times to add many search paths
		v.AddConfigPath(".")                                  // optionally look for config in the working directory

		err := v.ReadInConfig() // Find and read the config file*/
		if err != nil {
			log.WithError(err).Fatalf("Could not read main config file <%s>.", cmdConfig.Smtp.SMTPconfigFile)
		}
		smtpConfig := csmtp.SMTPConfig{}
		err = v.Unmarshal(&smtpConfig)
		if err != nil {
			log.WithError(err).Fatalf("Could not parse config file: <%s>", cmdConfig.Smtp.SMTPconfigFile)
		}

		if len(smtpConfig.AllowedHosts) == 0 {
			log.Fatal("Empty `allowed_hosts` is not allowed for smtp server")
		}

		err = csmtp.InitializeServer(smtpConfig)
		if err != nil {
			log.WithError(err).Fatal("Failed to init SMTP server")
		}
		go csmtp.StartServer()
	}

	sigHandler()
}
