// Copyleft (ɔ) 2019 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package go_remoteIDs

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
)

type PollerConfig struct {
	ScanInterval    uint16            `mapstructure:"scan_interval"`
	RemoteProtocols []string          `mapstructure:"remote_protocols"`
	StoreName       string            `mapstructure:"store_name"`
	StoreConfig     StoreConfig       `mapstructure:"store_settings"`
	NatsUrl         string            `mapstructure:"nats_url"`
	NatsQueue       string            `mapstructure:"nats_queue"`
	NatsTopics      map[string]string `mapstructure:"nats_topics"`
}

const (
	imapWorker      = "imap"
	twitterWorker   = "twitter"
	noPendingJobErr = "no pending job"
)

type Poller struct {
	Config PollerConfig
	dbh    *DbHandler
	mqh    *MqHandler
	sched  *Scheduler
	jobs   *JobsHandler
}

var poller *Poller

func init() {
	poller = new(Poller)
}

func InitPoller(config PollerConfig, verboseLog bool) (idpoller *Poller, err error) {
	if verboseLog {
		log.SetLevel(log.DebugLevel)
	}
	poller.Config = config

	poller.mqh, err = InitMqHandler()
	if err != nil {
		return nil, err
	}

	poller.dbh, err = initDbHandler()
	if err != nil {
		return nil, err
	}

	poller.sched, err = initScheduler()
	if err != nil {
		return nil, err
	}

	poller.jobs, err = initJobsHandler()
	if err != nil {
		return nil, err
	}

	return poller, nil
}

func (p *Poller) Start() error {
	// do a full sync with db once before starting Scheduler
	p.fullSync()
	p.sched.Start()
	return nil
}

func (p *Poller) Stop() {
	p.sched.Stop()
	p.mqh.Stop()
	p.dbh.Stop()
}

func (p *Poller) fullSync() {
	log.Info("[poller] starting full sync with db…")
	// update dbh's cache with 'active' remote identities found in db
	added, removed, updated, err := p.dbh.SyncCache()
	if err != nil {
		log.WithError(err).Warn("[dbSync] scheduler failed to update cache")
		return
	}
	// re-schedule jobs accordingly and update dbh's cache with jobs' cronId
	for _, entry := range added {
		entry, err := p.sched.AddSyncJobFor(entry)
		if err == nil {
			p.dbh.UpdateCacheEntry(entry)
		}
		// TODO: add protocol worker
	}
	for _, entry := range removed {
		p.sched.RemoveJobFor(entry)
		p.dbh.RemoveCacheEntry(entry.iDkey)
		//TODO: remove protocol worker
	}
	for _, entry := range updated {
		entry, err := p.sched.UpdateSyncJobFor(entry)
		if err == nil {
			p.dbh.UpdateCacheEntry(entry)
		}
		//TODO: update protocol worker
	}

	log.Infof("[poller] full sync ended : %d jobs added, %d jobs removed, %d jobs updated.\n           => %d jobs scheduled in cron table.",
		len(added), len(removed), len(updated), len(p.sched.MainCron.Entries()))
}
