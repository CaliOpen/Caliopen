/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package imap_worker

import (
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	log "github.com/Sirupsen/logrus"
	"github.com/emersion/go-imap"
	"github.com/satori/go.uuid"
	"strconv"
	"time"
)

type Fetcher struct {
	Store backends.IdentityStorage
	Lda   *Lda
}

type imapBox struct {
	lastSeenUid uint32
	lastSync    time.Time
	name        string
	uidValidity uint32
}

const (
	lastErrorKey      = "lastFetchError"
	dateFirstErrorKey = "firstErrorDate"
	dateLastErrorKey  = "lastErrorDate"
	errorsCountKey    = "errorsCount"
)

// FetchSyncRemote retrieves remote identity credentials and last sync data,
// connects to remote IMAP server to fetch new mails,
// adds X-Fetched-Imap headers before forwarding mails to lda,
// updates last sync data for identity in db.
func (f *Fetcher) SyncRemoteWithLocal(order IMAPfetchOrder) error {

	log.Infof("[Fetcher] will fetch mails for remote %s", order.RemoteId)

	// 1. retrieve infos from db
	rId, err := f.Store.RetrieveRemoteIdentity(order.UserId, order.RemoteId, true)
	if err != nil {
		log.WithError(err).Infof("[SyncRemoteWithLocal] failed to retrieve remote identity <%s> : <%s>", order.UserId, order.RemoteId)
		return err
	}
	if order.Password != "" {
		rId.Credentials["password"] = order.Password
	}

	// 1.2 check if a sync process is running
	if syncing, ok := rId.Infos["syncing"]; ok {
		startDate, _ := time.Parse(time.RFC3339, syncing)
		if time.Since(startDate)/time.Hour < failuresThreshold {
			log.Infof("[SyncRemoteWithLocal] avoiding concurrent sync for <%s>. Syncing in progress since %s", order.RemoteId, rId.Infos["syncing"])
			return nil
		}
	}
	// save syncing state in db to prevent concurrent sync
	(*rId).Infos["syncing"] = time.Now().Format(time.RFC3339)
	f.Store.UpdateRemoteIdentity(rId, map[string]interface{}{
		"Infos": rId.Infos,
	})

	// 2. sync/fetch with remote IMAP
	mails := make(chan *Email)
	lastsync := time.Time{}
	if rId.Infos["lastsync"] != "" {
		lastsync, err = time.Parse(time.RFC3339, rId.Infos["lastsync"])
		if err != nil {
			log.WithError(err).Warnf("[syncMails] failed to parse lastsync string <%s>", rId.Infos["lastsync"])
			lastsync = time.Time{}
		}
	}
	// Sync INBOX (only INBOX for now)
	// TODO : sync other mailbox(es) from rId.Infos params or from order
	lastseenuid, err := strconv.Atoi(rId.Infos["lastseenuid"])
	if err != nil {
		log.WithError(err).Warn("[SyncRemoteWithLocal] failed to get lastseenuid")
	}
	uidvalidity, err := strconv.Atoi(rId.Infos["uidvalidity"])
	if err != nil {
		log.WithError(err).Warn("[SyncRemoteWithLocal] failed to get uidvalidity")
	}
	box := imapBox{
		lastSeenUid: uint32(lastseenuid),
		lastSync:    lastsync,
		name:        "INBOX",
		uidValidity: uint32(uidvalidity),
	}
	go f.syncMails(rId, &box, mails)

	// 3. forward mails to lda as they come on mails chan
	errs := []error{}
	syncTimeout := time.Now()
	for mail := range mails {
		if box.lastSeenUid == mail.ImapUid {
			// do not forward last seen message, we already have it
			continue
		}
		err := f.Lda.deliverMail(mail, order.UserId)
		errs = append(errs, err)
		if err == nil {
			box.lastSeenUid = mail.ImapUid
		}
		if time.Since(syncTimeout)/time.Hour > failuresThreshold {
			errs = append(errs, errors.New("[Fetcher] sync timeout, aborting for "+order.RemoteId))
			close(mails)
			break
		}
	}

	for i, err := range errs {
		// TODO: improve error handling protocol
		if err != nil {
			log.WithError(err).Warnf("[Fetcher] SyncRemoteWithLocal error delivering mail #%d", i)
		}
	}

	// 4. backup sync state in db
	var fields map[string]interface{}
	delete((*rId).Infos, "syncing")
	if _, ok := rId.Infos[errorsCountKey]; ok {
		// if this key is in Infos then imap connection failed
		// do not update LastCheck time
		fields = map[string]interface{}{
			"Infos": rId.Infos,
		}
	} else {
		rId.LastCheck = time.Now()
		rId.Infos["uidvalidity"] = strconv.Itoa(int(box.uidValidity))
		rId.Infos["lastsync"] = rId.LastCheck.Format(time.RFC3339)
		rId.Infos["lastseenuid"] = strconv.Itoa(int(box.lastSeenUid))
		fields = map[string]interface{}{
			"LastCheck": rId.LastCheck,
			"Infos":     rId.Infos,
		}
	}
	err = f.Store.UpdateRemoteIdentity(rId, fields)
	if err != nil {
		log.WithError(err).Warnf("[syncMails] failed to backup sync state")
		return err
	}

	log.Infof("[Fetcher] all done for %s : %d new mail(s) fetched", order.RemoteId, len(errs))
	return nil
}

// FetchRemoteToLocal blindly fetches all mails from remote without retrieving/saving any state in RemoteIdentity
func (f *Fetcher) FetchRemoteToLocal(order IMAPfetchOrder) error {
	rId := RemoteIdentity{
		UserId: UUID(uuid.FromStringOrNil(order.UserId)),
		Infos: map[string]string{
			"server": order.Server,
		},
		Credentials: Credentials{
			"username": order.Login,
			"password": order.Password,
		},
	}

	box := imapBox{
		lastSync: time.Time{},
		name:     order.Mailbox,
	}

	// 2. fetch remote messages
	mails := make(chan *Email, 10)
	go f.fetchMails(&rId, &box, mails)
	//TODO errors handling

	// 3. forward mails to lda
	errs := make([]error, len(mails))
	for mail := range mails {
		err := f.Lda.deliverMail(mail, order.UserId)
		errs = append(errs, err)
	}

	return nil
}

// fetchMails fetches all messages from remote mailbox and returns well-formed Emails for lda.
func (f *Fetcher) fetchMails(rId *RemoteIdentity, box *imapBox, ch chan *Email) (err error) {
	tlsConn, imapClient, provider, err := imapLogin(rId)
	// Don't forget to logout and close chan
	defer func() {
		imapClient.Logout()
		log.Println("Logged out")
		close(ch)
	}()
	if err != nil {
		return f.handleFetchFailure(rId, WrapCaliopenErr(err, WrongCredentialsErr, "imapLogin failure"))
	} else {
		delete((*rId).Infos, lastErrorKey)
		delete((*rId).Infos, errorsCountKey)
		delete((*rId).Infos, dateFirstErrorKey)
		delete((*rId).Infos, dateLastErrorKey)
	}

	newMessages := make(chan *imap.Message, 10)
	go fetchMailbox(box, imapClient, provider, newMessages) //TODO : errors handling
	for msg := range newMessages {
		mail, err := MarshalImap(msg, buildXheaders(tlsConn, imapClient, rId, box, msg, provider))
		if err != nil {
			//todo
			continue
		}
		ch <- mail
	}

	return
}

// fetchSyncMails reads last sync state for remote identity,
// fetches new messages accordingly, and returns well-formed Emails for lda.
func (f *Fetcher) syncMails(rId *RemoteIdentity, box *imapBox, ch chan *Email) (err error) {

	tlsConn, imapClient, provider, err := imapLogin(rId)
	if err != nil {
		return f.handleFetchFailure(rId, WrapCaliopenErr(err, WrongCredentialsErr, "imapLogin failure"))
	} else {
		delete((*rId).Infos, lastErrorKey)
		delete((*rId).Infos, errorsCountKey)
		delete((*rId).Infos, dateFirstErrorKey)
		delete((*rId).Infos, dateLastErrorKey)
	}
	// Don't forget to logout and close chan
	defer func() {
		imapClient.Logout()
		close(ch)
		log.Println("Logged out")
	}()

	newMessages := make(chan *imap.Message, 10)
	//TODO : manage closing
	go syncMailbox(box, imapClient, provider, newMessages) //TODO : errors handling

	// read new messages coming from imap chan and write to lda chan
	for msg := range newMessages {
		xHeaders := buildXheaders(tlsConn, imapClient, rId, box, msg, provider)
		mail, err := MarshalImap(msg, xHeaders)
		if err != nil {
			//todo
			continue
		} else {
			ch <- mail
		}
	}
	return
}

// handleFetchFailure logs a warn and save failure log in db.
// If failures reach failuresThreshold, remote id is disabled and a new notification is emitted.
func (f *Fetcher) handleFetchFailure(rId *RemoteIdentity, err CaliopenError) error {

	// ensure errors data fields are present
	if _, ok := rId.Infos[lastErrorKey]; !ok {
		(*rId).Infos[lastErrorKey] = ""
	}
	if _, ok := rId.Infos[dateFirstErrorKey]; !ok {
		(*rId).Infos[dateFirstErrorKey] = ""
	}
	if _, ok := rId.Infos[dateLastErrorKey]; !ok {
		(*rId).Infos[dateLastErrorKey] = ""
	}
	if _, ok := rId.Infos[errorsCountKey]; !ok {
		(*rId).Infos[errorsCountKey] = "0"
	}

	// log last error
	(*rId).Infos[lastErrorKey] = "imap connection failed : " + err.Cause().Error()
	// increment counter
	count, _ := strconv.Atoi(rId.Infos[errorsCountKey])
	count++
	(*rId).Infos[errorsCountKey] = strconv.Itoa(count)

	// update dates
	lastDate := time.Now()
	var firstDate time.Time
	firstDate, _ = time.Parse(time.RFC3339, rId.Infos[dateFirstErrorKey])
	if firstDate.IsZero() {
		firstDate = lastDate
	}
	(*rId).Infos[dateFirstErrorKey] = firstDate.Format(time.RFC3339)
	(*rId).Infos[dateLastErrorKey] = lastDate.Format(time.RFC3339)

	// check failuresThreshold
	if lastDate.Sub(firstDate)/time.Hour > failuresThreshold {
		f.disableRemoteIdentity(rId)
	}

	// unlock sync state
	delete((*rId).Infos, "syncing")

	// udpate RemoteIdentity in db
	return f.Store.UpdateRemoteIdentity(rId, map[string]interface{}{
		"Infos": rId.Infos,
	})

}

func (f *Fetcher) disableRemoteIdentity(rId *RemoteIdentity) {
	(*rId).Status = "inactive"
	f.Store.UpdateRemoteIdentity(rId, map[string]interface{}{
		"Status": "inactive",
	})
	f.emitNotification()
}

func (f Fetcher) emitNotification() {
	//TODO
}
