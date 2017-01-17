package caliopen_smtp

import "time"

var (
	Version   string = "0.1.0"
	Commit    string
	BuildTime string

	StartTime      time.Time
	ConfigLoadTime time.Time
)

func init() {
	// If version, commit, or build time are not set, make that clear.
	if Version == "" {
		Version = "unknown"
	}
	if Commit == "" {
		Commit = "unknown"
	}
	if BuildTime == "" {
		BuildTime = "unknown"
	}

	StartTime = time.Now()
}
