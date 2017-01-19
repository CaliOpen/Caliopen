// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package cmd

import (
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"path/filepath"
)

var (
	verbose        bool
	configFileName string
	configPath     string
	pidFile        string
	AppsFS         afero.Fs
	cmdConfig      CmdConfig
	RootCmd        = &cobra.Command{
		Use:   "caliopen",
		Short: "Caliopen main application",
		Long: `Caliopen is a messaging platform.
The best way to discuss with your contacts, while preserving your privacy.`,
		Run: nil,
	}
)

func init() {
	cmdConfig = CmdConfig{}
	AppsFS = afero.NewOsFs()

	cobra.OnInitialize()
	RootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false,
		"print out more debug information")
	RootCmd.PersistentFlags().StringVarP(&configFileName, "configfile", "c",
		"caliopen-go-main_dev", "Name of the configuration file, without extension. (YAML, TOML, JSON… allowed)")
	RootCmd.PersistentFlags().StringVarP(&configPath, "configpath", "",
		"../../../configs/", "Main config file path.")
	RootCmd.PersistentFlags().StringVarP(&pidFile, "pid-file", "p",
		"/var/run/caliopen.pid", "Path to the pid file")
	RootCmd.PersistentPreRun = func(cmd *cobra.Command, args []string) {
		if verbose {
			log.SetLevel(log.DebugLevel)
		} else {
			log.SetLevel(log.InfoLevel)
		}
	}

}

// Read and parse go-main configuration file
func readConfig(readAll bool) error {
	// load in the main config. Reading from YAML, TOML, JSON, HCL and Java properties config files
	mainViper := viper.New()
	mainViper.SetConfigName(configFileName)                       // name of config file (without extension)
	mainViper.AddConfigPath(configPath)                           // path to look for the config file in
	mainViper.AddConfigPath("$CALIOPENROOT/src/backend/configs/") // call multiple times to add many search paths
	mainViper.AddConfigPath(".")                                  // optionally look for config in the working directory

	err := mainViper.ReadInConfig() // Find and read the config file*/
	if err != nil {
		log.WithError(err).Infof("Could not read main config file <%s>.", configFileName)
		return err
	}
	err = mainViper.Unmarshal(&cmdConfig)
	if err != nil {
		log.WithError(err).Infof("Could not parse main config file: <%s>", configFileName)
		return err
	}

	apiViper := viper.New()
	apiViper.SetConfigName(cmdConfig.Apis.GoRESTconfigFile)
	apiViper.AddConfigPath(cmdConfig.Apis.GoRESTconfigPath)
	apiViper.AddConfigPath(configPath)
	apiViper.AddConfigPath("$CALIOPENROOT/src/backend/configs/")
	apiViper.AddConfigPath(".")

	ldaViper := viper.New()
	ldaViper.SetConfigName(cmdConfig.Smtp.SMTPconfigFile)
	ldaViper.AddConfigPath(cmdConfig.Smtp.SMTPconfigPath)
	ldaViper.AddConfigPath(configPath)
	ldaViper.AddConfigPath("$CALIOPENROOT/src/backend/configs/")
	ldaViper.AddConfigPath(".")

	// load APIs config
	err = apiViper.ReadInConfig()
	if err != nil {
		log.WithError(err).Infof("Could not read api config file <%s>.", cmdConfig.Apis.GoRESTconfigFile)
		return err
	}

	err = apiViper.Unmarshal(&APIsConfig{})
	if err != nil {
		log.WithError(err).Infof("Could not parse api config file: <%s>", cmdConfig.Apis.GoRESTconfigFile)
		return err
	}

	// load lda config (if needed)
	if withSmtp || readAll {
		err = ldaViper.ReadInConfig()
		if err != nil {
			log.WithError(err).Infof("Could not read lda config file <%s>.", cmdConfig.Smtp.SMTPconfigFile)
			return err
		}

		err = apiViper.Unmarshal(&SMTPConfig{})
		if err != nil {
			log.WithError(err).Infof("Could not parse lda config file: <%s>", cmdConfig.Smtp.SMTPconfigFile)
			return err
		}
	}
	// check that pyramid config file exist (if needed)
	if withPyramid || readAll {

		paths := []string{
			cmdConfig.Apis.PyRESTconfigPath,
			configPath,
			"$CALIOPENROOT/src/backend/configs/",
			".",
		}
		exist := false
		for _, path := range paths {
			if exist, _ = afero.Exists(AppsFS, filepath.Join(path, cmdConfig.Apis.PyRESTconfigFile)); exist {
				cmdConfig.Apis.PyRESTresolvedConfigPath = filepath.Join(path, cmdConfig.Apis.PyRESTconfigFile)
				break
			}
		}

		if !exist {
			log.WithError(err).Infof("Could not read pyramid config file <%s>.", cmdConfig.Apis.PyRESTconfigFile)
			return err
		}
	}
	return nil
}

type CmdConfig struct {
	Apis APIsConfig
	Smtp SMTPConfig
}

type APIsConfig struct {
	PyRESTconfigPath         string `mapstructure:"py_rest_config_path"`
	PyRESTconfigFile         string `mapstructure:"py_rest_config_file"`
	PyRESTresolvedConfigPath string

	GoRESTconfigPath string `mapstructure:"go_rest_config_path"`
	GoRESTconfigFile string `mapstructure:"go_rest_config_file"`

	GoProxyConfigPath string `mapstructure:"go_proxy_config_path"`
	GoProxyConfigFile string `mapstructure:"go_proxy_config_file"`
}

type SMTPConfig struct {
	SMTPconfigPath string `mapstructure:"smtp_config_path"`
	SMTPconfigFile string `mapstructure:"smtp_config_file"`
}
