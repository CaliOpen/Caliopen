/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package go_remoteIDs

import (
	log "github.com/Sirupsen/logrus"
)

// AddJobFor parses remote identity data to build appropriate job and adds it to MainCron
func (p *Poller) AddJobFor(idkey string) (err error) {
	if entry, ok := p.Cache[idkey]; ok {
		switch entry.remoteID.Type {
		case "imap":
			cronStr := "@every " + entry.pollInterval + "m"
			entry.cronId, err = p.MainCron.AddJob(cronStr, imapJob{
				remoteId:  entry.remoteID.RemoteId.String(),
				natsTopic: p.Config.NatsTopics["imap"],
				poller:    p,
				userId:    entry.remoteID.UserId.String(),
			})
			if err != nil {
				log.WithError(err).Warn("[AddJobFor] failed to add job to MainCron")
				return
			}
			p.Cache[idkey] = entry
		default:
			log.WithError(err).Warnf("[AddJobFor] unknow Remote Identity type <%s>", entry.remoteID.Type)
			return
		}
		return
	} else {
		log.WithError(err).Warnf("[AddJobFor] failed to retrieve cache key <%s>", idkey)
		return
	}
}

// RemoveJobFor removes remote identity's job from being run in the future
func (p *Poller) RemoveJobFor(idkey string) (err error) {
	if entry, ok := p.Cache[idkey]; ok {
		p.MainCron.Remove(entry.cronId)
		return
	} else {
		log.WithError(err).Warnf("[RemoveJobFor] failed to retrieve cache key <%s>", idkey)
		return
	}
	return
}

// UpdateJobFor removes remote identity's job and re-schedule it with new pollinterval
func (p *Poller) UpdateJobFor(idkey string) (err error) {
	err = p.RemoveJobFor(idkey)
	if err != nil {
		return
	}
	return p.AddJobFor(idkey)
}
