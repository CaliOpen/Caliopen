/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package cmd

import (
	. "github.com/CaliOpen/Caliopen/src/backend/workers/go.remoteIDs"
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	config     PollerConfig
	configFile string
	configPath string
	verbose    bool
	version    bool
	RootCmd    = &cobra.Command{
		Use:   "idpoller",
		Short: "Remote Identities poller",
		Long:  `idpoller is a daemon to monitor users's remote identities polls and send NATS messages accordingly`,
		Run:   nil,
	}
)

const __version__ = "0.23.0"

func init() {
	RootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false,
		"print out more debug information")
	RootCmd.PersistentFlags().BoolVarP(&version, "version", "V", false,
		"print out the version of this program")
	RootCmd.Run = func(cmd *cobra.Command, args []string) {
		if version {
			log.Infof("idpoller version %s", __version__)
		}
		if len(args) == 0 {
			cmd.Help()
		}
		readConfig(&config)
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
	Short: "Print the version number of idpoller",
	Long:  `All software has versions. This is idpoller's'`,
	Run: func(cmd *cobra.Command, args []string) {
		log.Infof("idpoller version %s", __version__)
	},
}

// ReadConfig which should be called at startup, or when a SIG_HUP is caught
func readConfig(config *PollerConfig) error {
	// load in the main config. Reading from YAML, TOML, JSON, HCL and Java properties config files
	v := viper.New()
	v.SetConfigName(configFile)                           // name of config file (without extension)
	v.AddConfigPath(configPath)                           // path to look for the config file in
	v.AddConfigPath("$CALIOPENROOT/src/backend/configs/") // call multiple times to add many search paths
	v.AddConfigPath(".")                                  // optionally look for config in the working directory

	err := v.ReadInConfig() // Find and read the config file
	if err != nil {
		log.WithError(err).Infof("Could not read main config file <%s>.", configFile)
		return err
	}
	err = v.Unmarshal(config)
	if err != nil {
		log.WithError(err).Infof("Could not parse config file: <%s>", configFile)
		return err
	}

	return nil
}
