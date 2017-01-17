// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

// APIs() launches the Caliopen application's interfaces processes

package cmd

import (
	"bufio"
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server"
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/TCP/go.server"
	log "github.com/Sirupsen/logrus"
	"github.com/flashmob/go-guerrilla"
	"github.com/hpcloud/tail"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
)

var (
	withLda     bool
	withPyramid bool

	APIsCmd = &cobra.Command{
		Use:   "APIs",
		Short: "start the caliopen application's APIs servers",
		Run:   APIs,
	}

	signalChannel = make(chan os.Signal, 1) // for trapping SIG_HUP
)

func init() {
	APIsCmd.PersistentFlags().BoolVar(&withLda, "lda", true, "Start the embedded lmtp/lda server")
	APIsCmd.PersistentFlags().BoolVar(&withPyramid, "pyramid", true, "Launch the python API (pserve process)")
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
			log.Infof("Shutdown signal caught")
			//lda.Shutdown()

			//pyramid shutdown
			pyPID, err := afero.ReadFile(AppsFS, "pyramid.pid")
			if err != nil {
				log.WithError(err).Info("unable to read pyramid.pid file. You may have to kill pserve process.")
			}
			exec.Command("kill", string(pyPID)).Run()

			//app.Shutdown()
			log.Infof("Shutdown completd, exiting.")
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

	go sigHandler()

	// start GO REST server
	go rest_api.StartServer()

	// start Pyramid REST server
	if withPyramid {
		go func() {
			//for now we launch 'pserve'.
			//we should launch pyramid as a WSGI endpoint and make use of our proxy.
			cmd := exec.Command("/Users/stan/Dev/Caliopen/github-caliopen-venv/bin/pserve",
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

			s := bufio.NewScanner(pserveStdout)
			for s.Scan() {
				log.WithField("Log", s.Text()).Info("(PSERVE)")
			}
			err = cmd.Wait()
			if err != nil {
				log.WithError(err).Info("unable to launch pserve")
			}
			if err != nil {
				log.WithError(err).Info("unable to start REST py.server")
			}

			for line := range pyramidlog.Lines {
				log.WithField("Log", line.Text).Info("(PYRAMID API)")
			}
		}()
	}

	// start HTTP reverse proxy
	go rest_api.StartProxy()

	// start TCP API server
	go tcp_api.StartServer()

	mux := http.NewServeMux()

	goHandler := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: "http",
		Host:   "127.0.0.1:6544",
	})

	pyramidHandler := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: "http",
		Host:   "127.0.0.1:6543",
	})

	mux.Handle("/api/v2/", goHandler)

	//everything else goes to pyramid for now
	mux.Handle("/", pyramidHandler)

	log.Println("HTTP proxy listening on port :3141") // guess why this port # ?
	log.Fatal(http.ListenAndServe("127.0.0.1:3141", mux))

	defer func() {
		rest_api.StopServer()

	}()
}
