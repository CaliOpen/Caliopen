// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package main

import (
	"fmt"
	"os"
	"github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server/cmd/caliopen_rest/cli_cmds"
)

func main() {
	// launch 'root cmd' that will register other commands that could be executed
	if err := cmd.RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}
