package main

import (
	"fmt"
	"github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp/cmd/caliopen_lmtpd/cli-cmds"
	"os"
)

func main() {
	if err := cmd.RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}
