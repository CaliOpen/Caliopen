// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package cmd

import (
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/cobra"
)

var (
	verbose bool
	version bool
	RootCmd = &cobra.Command{
		Use:   "caliopen_rest",
		Short: "Caliopen REST HTTP API",
		Long:  `HTTP server (& proxy) for the frontend applications`,
		Run:   nil,
	}
)

const __version__ = "0.23.0"

func init() {
	cobra.OnInitialize()
	RootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false,
		"print out more debug information")
	RootCmd.PersistentFlags().BoolVarP(&version, "version", "V", false,
		"print out the version of this program")
	RootCmd.Run = func(cmd *cobra.Command, args []string) {
		if version {
			log.Infof("Caliopen APIv2 version %s", __version__)
		}
	}
	RootCmd.PersistentPreRun = func(cmd *cobra.Command, args []string) {
		if verbose {
			log.SetLevel(log.DebugLevel)
		} else {
			log.SetLevel(log.InfoLevel)
		}
	}
	RootCmd.AddCommand(versionCmd)
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of Caliopen REST api",
	Long:  `All software has versions. This is Caliopen API's`,
	Run: func(cmd *cobra.Command, args []string) {
		log.Infof("Caliopen REST API version %s", __version__)
	},
}
