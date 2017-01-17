package main

import (
	"fmt"
	"os"
	"github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp/cli/cli-cmds"
)

func main() {
	if err := cmd.RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}
