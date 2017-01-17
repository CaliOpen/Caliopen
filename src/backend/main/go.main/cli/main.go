package main

import (
	"fmt"
	"os"

	"github.com/CaliOpen/CaliOpen/src/backend/main/go.main/cli/cli-cmds"
)

func main() {

	// launch 'root cmd' that will register other commands that could be executed
	if err := cmd.RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}
