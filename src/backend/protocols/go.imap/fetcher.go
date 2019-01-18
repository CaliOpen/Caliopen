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
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/users"
	log "github.com/Sirupsen/logrus"
	"github.com/emersion/go-imap"
	"github.com/satori/go.uuid"
	"strconv"
	"time"
)

type Fetcher struct {
	Hostname string
	Store    backends.LDAStore
	Lda      *Lda
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
func (f *Fetcher) SyncRemoteWithLocal(order IMAPorder) error {

	log.Infof("[Fetcher] will fetch mails for remote %s", order.RemoteId)

	// 1. retrieve infos from db
	userIdentity, err := f.Store.RetrieveUserIdentity(order.UserId, order.RemoteId, true)
	if err != nil {
		log.WithError(err).Infof("[SyncRemoteWithLocal] failed to retrieve remote identity <%s> : <%s>", order.UserId, order.RemoteId)
		return err
	}
	if order.Password != "" {
		(*userIdentity.Credentials)["inpassword"] = order.Password
	}

	// 1.2 check if a sync process is running
	if syncing, ok := userIdentity.Infos["syncing"]; ok && syncing != "" {
		startDate, e := time.Parse(time.RFC3339, syncing)
		if e == nil && time.Since(startDate)/time.Hour < failuresThreshold {
			log.Infof("[SyncRemoteWithLocal] avoiding concurrent sync for <%s>. Syncing in progress since %s", order.RemoteId, userIdentity.Infos["syncing"])
			return nil
		}
	}
	// save syncing state in db to prevent concurrent sync
	(*userIdentity).Infos["syncing"] = time.Now().Format(time.RFC3339)
	f.Store.UpdateUserIdentity(userIdentity, map[string]interface{}{
		"Infos": userIdentity.Infos,
	})

	// 2. sync/fetch with remote IMAP
	mails := make(chan *Email)
	lastsync := time.Time{}
	if userIdentity.Infos["lastsync"] != "" {
		lastsync, err = time.Parse(time.RFC3339, userIdentity.Infos["lastsync"])
		if err != nil {
			log.WithError(err).Warnf("[syncMails] failed to parse lastsync string <%s>", userIdentity.Infos["lastsync"])
			lastsync = time.Time{}
		}
	}
	// Sync INBOX (only INBOX for now)
	// TODO : sync other mailbox(es) from userIdentity.Infos params or from order
	lastseenuid, err := strconv.Atoi(userIdentity.Infos["lastseenuid"])
	if err != nil {
		log.WithError(err).Warn("[SyncRemoteWithLocal] failed to get lastseenuid")
	}
	uidvalidity, err := strconv.Atoi(userIdentity.Infos["uidvalidity"])
	if err != nil {
		log.WithError(err).Warn("[SyncRemoteWithLocal] failed to get uidvalidity")
	}
	box := imapBox{
		lastSeenUid: uint32(lastseenuid),
		lastSync:    lastsync,
		name:        "INBOX",
		uidValidity: uint32(uidvalidity),
	}
	go f.syncMails(userIdentity, &box, mails)

	// 3. forward mails to lda as they come on mails chan
	errs := []error{}
	syncTimeout := time.Now()
	for mail := range mails {
		if mail.ImapUid <= box.lastSeenUid {
			// do not forward seen message, we already have it
			continue
		}

		err := f.Lda.deliverMail(mail, order.UserId)
		//var err error // swap this line with the line above to avoid importing emails in debug mode
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
	delete((*userIdentity).Infos, "syncing")
	userIdentity.LastCheck = time.Now()
	if _, ok := userIdentity.Infos[errorsCountKey]; !ok {
		// if errorsCountKey IS NOT in Infos then sync succeeded
		// update infos accordingly
		userIdentity.Infos["uidvalidity"] = strconv.Itoa(int(box.uidValidity))
		userIdentity.Infos["lastsync"] = userIdentity.LastCheck.Format(time.RFC3339)
		userIdentity.Infos["lastseenuid"] = strconv.Itoa(int(box.lastSeenUid))
	}
	fields = map[string]interface{}{
		"LastCheck": userIdentity.LastCheck,
		"Infos":     userIdentity.Infos,
	}
	err = f.Store.UpdateUserIdentity(userIdentity, fields)
	if err != nil {
		log.WithError(err).Warnf("[syncMails] failed to backup sync state")
		return err
	}

	log.Infof("[Fetcher] all done for %s : %d new mail(s) fetched", order.RemoteId, len(errs))
	return nil
}

// FetchRemoteToLocal blindly fetches all mails from remote without retrieving/saving any state in UserIdentity
func (f *Fetcher) FetchRemoteToLocal(order IMAPorder) error {
	userIdentity := UserIdentity{
		UserId: UUID(uuid.FromStringOrNil(order.UserId)),
		Infos: map[string]string{
			"inserver": order.Server,
		},
		Credentials: &Credentials{
			"inusername": order.Login,
			"inpassword": order.Password,
		},
	}

	box := imapBox{
		lastSync: time.Time{},
		name:     order.Mailbox,
	}

	// 2. fetch remote messages
	mails := make(chan *Email, 10)
	go f.fetchMails(&userIdentity, &box, mails)
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
func (f *Fetcher) fetchMails(userIdentity *UserIdentity, box *imapBox, ch chan *Email) (err error) {
	if userIdentity.Infos["authtype"] == Oauth2 {
		err = users.ValidateOauth2Credentials(userIdentity, f, true)
		if err != nil {
			return f.handleFetchFailure(userIdentity, WrapCaliopenErr(err, WrongCredentialsErr, "Oauth2 validation failure"))
		}
	}
	tlsConn, imapClient, provider, err := imapLogin(userIdentity)
	// Don't forget to logout and close chan
	defer func() {
		imapClient.Logout()
		log.Println("Logged out")
		close(ch)
	}()
	if err != nil {
		return f.handleFetchFailure(userIdentity, WrapCaliopenErr(err, WrongCredentialsErr, "imapLogin failure"))
	} else {
		delete((*userIdentity).Infos, lastErrorKey)
		delete((*userIdentity).Infos, errorsCountKey)
		delete((*userIdentity).Infos, dateFirstErrorKey)
		delete((*userIdentity).Infos, dateLastErrorKey)
	}

	newMessages := make(chan *imap.Message, 10)
	go fetchMailbox(box, imapClient, provider, newMessages) //TODO : errors handling
	for msg := range newMessages {
		mail, err := MarshalImap(msg, buildXheaders(tlsConn, userIdentity, box, msg, provider))
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
func (f *Fetcher) syncMails(userIdentity *UserIdentity, box *imapBox, ch chan *Email) (err error) {
	// Don't forget to close chan before leaving
	defer close(ch)
	if userIdentity.Infos["authtype"] == Oauth2 {
		err = users.ValidateOauth2Credentials(userIdentity, f, true)
		if err != nil {
			return f.handleFetchFailure(userIdentity, WrapCaliopenErr(err, WrongCredentialsErr, "Oauth2 validation failure"))
		}
	}
	tlsConn, imapClient, provider, err := imapLogin(userIdentity)
	if err != nil {
		return f.handleFetchFailure(userIdentity, WrapCaliopenErr(err, WrongCredentialsErr, "imapLogin failure"))
	} else {
		delete((*userIdentity).Infos, lastErrorKey)
		delete((*userIdentity).Infos, errorsCountKey)
		delete((*userIdentity).Infos, dateFirstErrorKey)
		delete((*userIdentity).Infos, dateLastErrorKey)
	}
	// Don't forget to logout
	defer func() {
		imapClient.Logout()
		log.Println("Logged out")
	}()

	newMessages := make(chan *imap.Message, 10)
	//TODO : manage closing
	go syncMailbox(box, imapClient, provider, newMessages) //TODO : errors handling

	// read new messages coming from imap chan and write to lda chan with added custom headers
	for msg := range newMessages {
		xHeaders := buildXheaders(tlsConn, userIdentity, box, msg, provider)
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
func (f *Fetcher) handleFetchFailure(userIdentity *UserIdentity, err CaliopenError) error {

	// ensure errors data fields are present
	if _, ok := userIdentity.Infos[lastErrorKey]; !ok {
		(*userIdentity).Infos[lastErrorKey] = ""
	}
	if _, ok := userIdentity.Infos[dateFirstErrorKey]; !ok {
		(*userIdentity).Infos[dateFirstErrorKey] = ""
	}
	if _, ok := userIdentity.Infos[dateLastErrorKey]; !ok {
		(*userIdentity).Infos[dateLastErrorKey] = ""
	}
	if _, ok := userIdentity.Infos[errorsCountKey]; !ok {
		(*userIdentity).Infos[errorsCountKey] = "0"
	}

	// log last error
	(*userIdentity).Infos[lastErrorKey] = "imap connection failed : " + err.Cause().Error()
	log.WithError(err.Cause()).Warnf("imap connection failed for remote identity %s", userIdentity.Id)
	// increment counter
	count, _ := strconv.Atoi(userIdentity.Infos[errorsCountKey])
	count++
	(*userIdentity).Infos[errorsCountKey] = strconv.Itoa(count)

	// update dates
	lastDate := time.Now()
	var firstDate time.Time
	firstDate, _ = time.Parse(time.RFC3339, userIdentity.Infos[dateFirstErrorKey])
	if firstDate.IsZero() {
		firstDate = lastDate
	}
	(*userIdentity).Infos[dateFirstErrorKey] = firstDate.Format(time.RFC3339)
	(*userIdentity).Infos[dateLastErrorKey] = lastDate.Format(time.RFC3339)

	// check failuresThreshold
	if lastDate.Sub(firstDate)/time.Hour > failuresThreshold {
		f.disableRemoteIdentity(userIdentity)
	}

	// unlock sync state
	delete((*userIdentity).Infos, "syncing")

	// udpate UserIdentity in db
	return f.Store.UpdateUserIdentity(userIdentity, map[string]interface{}{
		"Infos":     userIdentity.Infos,
		"LastCheck": lastDate,
	})

}

func (f *Fetcher) disableRemoteIdentity(userIdentity *UserIdentity) {
	(*userIdentity).Status = "inactive"
	f.Store.UpdateUserIdentity(userIdentity, map[string]interface{}{
		"Status": "inactive",
	})
	f.emitNotification()
}

func (f Fetcher) emitNotification() {
	//TODO
}

/* Oauth2Interfacer implementation */

func (f *Fetcher) GetProviders() map[string]Provider {
	return f.Lda.Providers
}

func (f *Fetcher) GetHostname() string {
	return f.Lda.Config.Hostname

}

func (f *Fetcher) GetIdentityStore() backends.IdentityStorageUpdater {
	return f.Store
}
