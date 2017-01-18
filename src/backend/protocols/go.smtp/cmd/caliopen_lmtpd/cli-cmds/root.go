package cmd

import (
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/cobra"
)

var RootCmd = &cobra.Command{
	Use:   "caliopen_lmtpd",
	Short: "LMTP daemon",
	Long:  `LMTP daemon for the purpose of bridging MTAs to our local delivery agent.`,
	Run:   nil,
}

var (
	verbose bool
)

func init() {
	cobra.OnInitialize()
	RootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false,
		"print out more debug information")
	RootCmd.PersistentPreRun = func(cmd *cobra.Command, args []string) {
		if verbose {
			log.SetLevel(log.DebugLevel)
		} else {
			log.SetLevel(log.InfoLevel)
		}
	}
}
