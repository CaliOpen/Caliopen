/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package go_remoteIDs

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
)

// AddJobFor parses remote identity data to build appropriate job and adds it to MainCron
func (p *Poller) AddJobFor(idkey string) (err error) {
	p.cacheMux.Lock()
	defer p.cacheMux.Unlock()
	if entry, ok := p.Cache[idkey]; ok {
		switch entry.remoteProtocol {
		case EmailProtocol, ImapProtocol:
			cronStr := "@every " + entry.pollInterval + "m"
			entry.cronId, err = p.MainCron.AddJob(cronStr, imapJob{
				remoteId:  entry.remoteID.String(),
				natsTopic: p.Config.NatsTopics["imap"],
				poller:    p,
				userId:    entry.userID.String(),
			})
			if err != nil {
				log.WithError(err).Warn("[AddJobFor] failed to add job to MainCron")
				return
			}
			p.Cache[idkey] = entry
		case TwitterProtocol:
			cronStr := "@every " + entry.pollInterval + "m"
			entry.cronId, err = p.MainCron.AddJob(cronStr, twitterJob{
				remoteId:  entry.remoteID.String(),
				natsTopic: p.Config.NatsTopics["twitter_dm"],
				poller:    p,
				userId:    entry.userID.String(),
			})
			if err != nil {
				log.WithError(err).Warn("[AddJobFor] failed to add job to MainCron")
				return
			}
			p.Cache[idkey] = entry
			p.addWorkerFor(idkey)
		default:
			log.WithError(err).Warnf("[AddJobFor] unknow Remote Identity protocol <%s>", entry.remoteProtocol)
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
	p.cacheMux.Lock()
	defer p.cacheMux.Unlock()
	if entry, ok := p.Cache[idkey]; ok {
		p.MainCron.Remove(entry.cronId)
		switch entry.remoteProtocol {
		case TwitterProtocol:
			p.removeWorkerFor(idkey)
		}
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
	err = p.AddJobFor(idkey)
	if err != nil {
		return
	}
	p.updateWorkerFor(idkey)
	return
}
