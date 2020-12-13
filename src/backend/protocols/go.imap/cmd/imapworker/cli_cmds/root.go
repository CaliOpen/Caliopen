/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package cmd

import (
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/cobra"
)

var (
	verbose bool
	version bool
	RootCmd = &cobra.Command{
		Use:   "imapworker",
		Short: "IMAP worker daemon",
		Long:  `IMAP worker is a daemon that subscribes to relevant messaging system queues and executes operations on remote IMAP servers`,
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
			log.Infof("IMAP worker version %s", __version__)
		}
		if len(args) == 0 {
			cmd.Help()
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
	Short: "Print the version number of IMAP worker",
	Long:  `All software has versions. This is IMAP worker's`,
	Run: func(cmd *cobra.Command, args []string) {
		log.Infof("IMAP worker version %s", __version__)
	},
}
