/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package go_remoteIDs

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/Sirupsen/logrus"
	"gopkg.in/robfig/cron.v2"
)

type cacheEntry struct {
	iDkey        string
	cronId       cron.EntryID
	pollInterval string
	remoteID     RemoteIdentity
}

func (p *Poller) updateCache() (added, removed, updated map[string]bool, err error) {
	added = make(map[string]bool)
	removed = make(map[string]bool)
	updated = make(map[string]bool)
	active := make(map[string]bool)
	const defaultInterval = "15"

	remotes, err := p.Store.RetrieveAllRemotes(false)
	if err != nil {
		logrus.WithError(err).Warn("[updateCache] failed to retrieve remote identities")
		return
	}

	for remote := range remotes {
		if p.statusTypeOK(remote) {
			idkey := remote.UserId.String() + remote.RemoteId.String()
			active[idkey] = true
			if entry, ok := p.Cache[idkey]; ok {
				//check if pollinterval has changed
				var pollInterval string
				var ok bool
				if pollInterval, ok = remote.Infos["pollinterval"]; !ok || pollInterval == "" {
					// do not resign, take a default value instead
					pollInterval = defaultInterval
				}
				if entry.pollInterval != pollInterval {
					entry.pollInterval = pollInterval
					updated[idkey] = true
				}
				p.Cache[idkey] = entry
			} else {
				var pollInterval string
				var ok bool
				if pollInterval, ok = remote.Infos["pollinterval"]; !ok || pollInterval == "" {
					// do not resign, take a default value instead
					pollInterval = defaultInterval
				}
				p.Cache[idkey] = cacheEntry{
					iDkey:        idkey,
					pollInterval: pollInterval,
					remoteID:     *remote,
				}
				added[idkey] = true
			}
		}
	}
	for key, _ := range p.Cache {
		if _, ok := active[key]; !ok {
			removed[key] = true
		}
	}
	return
}

// statusTypeOK checks if remote identity is 'active' and its type is within poller's scope
func (p *Poller) statusTypeOK(remote *RemoteIdentity) bool {
	if remote.Status != "active" {
		return false
	}
	for _, t := range p.Config.RemoteTypes {
		if t == remote.Type {
			return true
		}
	}
	return false
}
