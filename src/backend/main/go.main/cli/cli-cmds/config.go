// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// Load and print the application configuration

package cmd

import (
	"github.com/spf13/cobra"
	log "github.com/Sirupsen/logrus"
	"encoding/json"
)

var (
	ConfigCmd = &cobra.Command{
		Use:   "config",
		Short: "Load and print the application configuration",
		Run:   outputConfig,
	}
)

func init() {
	RootCmd.AddCommand(ConfigCmd)
}

func outputConfig (cmd *cobra.Command, args []string) {
	err := readConfig(true)
	if err != nil {
		log.Fatal(err)
	}
	j, _ := json.MarshalIndent(cmdConfig," ", " ")
	log.Infof("%s", j)
}