package cmd

import (
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/cobra"

	lda "github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp"
	guerrilla "github.com/flashmob/go-guerrilla"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version info",
	Long:  `Every software has a version. This is Caliopen_smtpd's`,
	Run: func(cmd *cobra.Command, args []string) {
		logVersion()
	},
}

func init() {
	RootCmd.AddCommand(versionCmd)
}

func logVersion() {
	log.Infof("caliopen_smtpd %s (guerrilla version %s)", lda.Version, guerrilla.Version)
	log.Debugf("Build Time: %s", guerrilla.BuildTime)
	log.Debugf("Commit:     %s", guerrilla.Commit)
}
