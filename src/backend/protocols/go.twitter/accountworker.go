// Copyleft (ɔ) 2018 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package twitterworker

import (
	"encoding/json"
	"errors"
	"fmt"
	broker "github.com/CaliOpen/Caliopen/src/backend/brokers/go.twitter"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/go-twitter/twitter"
	log "github.com/Sirupsen/logrus"
	"github.com/dghubble/oauth1"
	"sort"
	"strconv"
	"strings"
	"time"
)

type (
	AccountWorker struct {
		WorkerDesk       chan uint
		broker           *broker.TwitterBroker
		lastDMseen       string
		twitterClient    *twitter.Client
		userAccount      *TwitterAccount
		usersScreenNames map[int64]string // a cache facility to avoid calling too often twitter API for screen_name lookup
	}

	TwitterAccount struct {
		accessToken       string
		accessTokenSecret string
		userID            UUID
		remoteID          UUID
		screenName        string
	}
)

const (
	//WorkerDesk commands
	PollDM = uint(iota)
	PollTimeLine
	Stop

	lastSeenInfosKey = "lastseendm"
	lastSyncInfosKey = "lastsync"

	lastErrorKey      = "lastFetchError"
	dateFirstErrorKey = "firstErrorDate"
	dateLastErrorKey  = "lastErrorDate"
	errorsCountKey    = "errorsCount"
)

// NewWorker create a worker dedicated to a specific twitter account.
// A worker holds remote identity credentials and data, as well as user context connection to twitter API.
func NewAccountWorker(userID, remoteID string, worker Worker) (accountWorker *AccountWorker, err error) {
	accountWorker = new(AccountWorker)
	accountWorker.WorkerDesk = make(chan uint, 3)
	b, e := broker.Initialize(worker.Conf.BrokerConfig, worker.Store, worker.Index, worker.NatsConn, worker.Notifier)
	if e != nil {
		err = fmt.Errorf("[TwitterWorker]NewAccountWorker failed to initialize a twitter broker : %s", e)
		return nil, err
	}
	accountWorker.broker = b
	var remote *UserIdentity
	// retrieve data from db
	remote, err = accountWorker.broker.Store.RetrieveUserIdentity(userID, remoteID, true)
	if err != nil {
		log.WithError(err).Infof("[PollDM] failed to retrieve remote identity <%s> (user <%s>)", remoteID, userID)
		return
	}
	if remote.Credentials == nil {
		log.WithError(err).Infof("[PollDM] failed to retrieve credentials for remote identity <%s> (user <%s>)", remoteID, userID)
		return
	}
	accountWorker.userAccount = &TwitterAccount{
		accessToken:       (*remote.Credentials)["token"],
		accessTokenSecret: (*remote.Credentials)["secret"],
		userID:            remote.UserId,
		remoteID:          remote.Id,
		screenName:        remote.Identifier,
	}
	if lastseen, ok := remote.Infos[lastSeenInfosKey]; ok {
		accountWorker.lastDMseen = lastseen
	} else {
		accountWorker.lastDMseen = "0"
	}

	authConf := oauth1.NewConfig(worker.Conf.TwitterAppKey, worker.Conf.TwitterAppSecret)
	token := oauth1.NewToken(accountWorker.userAccount.accessToken, accountWorker.userAccount.accessTokenSecret)
	httpClient := authConf.Client(oauth1.NoContext, token)
	if accountWorker.twitterClient = twitter.NewClient(httpClient); accountWorker.twitterClient == nil {
		return nil, errors.New("[NewWorker] twitter api failed to create http client")
	}

	accountWorker.usersScreenNames = map[int64]string{}

	return
}

// Start begins infinite loops, until receiving stop order. This func must be call within goroutine.
func (worker *AccountWorker) Start() {
	go func(w *AccountWorker) {
		for {
			select {
			case egress, ok := <-worker.broker.Connectors.Egress:
				if !ok {
					log.Infof("Egress chan for worker %s has been closed. Shutting-down it.", worker.userAccount.userID.String()+worker.userAccount.remoteID.String())
					worker.WorkerDesk <- Stop
					return
				}
				err := worker.SendDM(egress.Order)
				if err != nil {
					egress.Ack <- &DeliveryAck{
						Err:      true,
						Response: err.Error(),
					}
				} else {
					egress.Ack <- &DeliveryAck{
						Err:      false,
						Response: "OK",
					}
				}
			case <-worker.broker.Connectors.Halt:
				worker.WorkerDesk <- Stop
				return
			}
		}
	}(worker)

deskLoop:
	for command := range worker.WorkerDesk {
		switch command {
		case PollDM:
			worker.PollDM()
		case Stop:
			worker.Stop()
			break deskLoop
		default:
			log.Warnf("worker received unknown command number %d", command)
		}
	}
}

func (worker *AccountWorker) Stop() {
	// destroy broker
	worker.broker.ShutDown()
	worker.broker = nil
	// close desk
	if _, ok := <-worker.WorkerDesk; ok {
		close(worker.WorkerDesk)
	}
}

// PollDM calls Twitter API endpoint to fetch DMs
// it passes unseen DM to its embedded broker
func (worker *AccountWorker) PollDM() {
	// do not forget to always write down last_check timestamp before leaving
	defer func() {
		e := worker.broker.Store.TimestampRemoteLastCheck(worker.userAccount.userID.String(), worker.userAccount.remoteID.String())
		if e != nil {
			log.WithError(e).Warnf("[AccountWorker %s] PollDM failed to update last_check state in db", worker.userAccount.remoteID.String())
		}
	}()
	// retrieve user_identity.infos
	accountInfos, retrieveErr := worker.broker.Store.RetrieveRemoteInfosMap(worker.userAccount.userID.String(), worker.userAccount.remoteID.String())
	if retrieveErr != nil {
		log.WithError(retrieveErr).Warnf("[AccountWorker %s] PollDM failed to retrieve infos map", worker.userAccount.remoteID.String())
		return
	}
	// retrieve DM list from twitter API
	DMs, _, err := worker.twitterClient.DirectMessages.EventsList(&twitter.DirectMessageEventsListParams{Count: 50})
	if err != nil {
		if e, ok := err.(twitter.APIError); ok {
			errorsMessages := new(strings.Builder)
			for _, err := range e.Errors {
				if err.Code == 88 {
					log.Infof("[AccountWorker %s] PollDM : twitter returned rate limit error, slowing down worker for account", worker.userAccount.remoteID)
					if pollInterval, ok := accountInfos["pollinterval"]; ok {
						interval, e := strconv.Atoi(pollInterval)
						if e == nil {
							newInterval := strconv.Itoa(interval * 2)
							accountInfos["pollinterval"] = newInterval
							worker.broker.Store.UpdateRemoteInfosMap(worker.userAccount.userID.String(), worker.userAccount.remoteID.String(), accountInfos)
							order := RemoteIDNatsMessage{
								IdentityId:   worker.userAccount.remoteID.String(),
								Order:        "update_interval",
								PollInterval: newInterval,
								Protocol:     "twitter",
								UserId:       worker.userAccount.userID.String(),
							}
							jorder, jerr := json.Marshal(order)
							if jerr == nil {
								worker.broker.NatsConn.Publish("idCache", jorder)
							}
						}
					}
				}
				errorsMessages.WriteString(err.Message + " ")
			}
			e := worker.saveErrorState(accountInfos, errorsMessages.String())
			if e != nil {
				log.WithError(e).Warnf("[AccountWorker %s] PollDM failed to update sync state in db", worker.userAccount.remoteID.String())
			}
			return

		} else {
			e := worker.saveErrorState(accountInfos, err.Error())
			if e != nil {
				log.WithError(e).Warnf("[AccountWorker %s] PollDM failed to update sync state in db", worker.userAccount.remoteID.String())
			}
			return
		}
	}

	sort.Sort(ByAscID(DMs.Events)) // reverse events order to get older DMs first

	if len(DMs.Events) > 0 && worker.dmNotSeen(DMs.Events[0]) {
		//TODO: handle pagination with `cursor` param
	}

	log.Infof("[AccountWorker %s] PollDM %d events retrieved", worker.userAccount.remoteID.String(), len(DMs.Events))
	for _, event := range DMs.Events {
		if worker.dmNotSeen(event) {
			//TODO: handle DM sent by user : remove or not ?

			//lookup sender & recipient's screen_names because there are not embedded in event object
			(*event.Message).SenderScreenName = worker.getAccountName(event.Message.SenderID)
			(*event.Message).Target.RecipientScreenName = worker.getAccountName(event.Message.Target.RecipientID)
			err = worker.broker.ProcessInDM(worker.userAccount.userID, worker.userAccount.remoteID, &event, true)
			if err != nil {
				// something went wrong, forget this DM
				log.WithError(err).Warnf("[AccountWorker %s] ProcessInDM failed for event : %+v", worker.userAccount.remoteID.String(), event)
				continue
			}
			worker.lastDMseen = event.ID
		}
	}
	delete(accountInfos, lastErrorKey)
	delete(accountInfos, errorsCountKey)
	delete(accountInfos, dateFirstErrorKey)
	delete(accountInfos, dateLastErrorKey)
	e := worker.broker.Store.UpdateRemoteInfosMap(worker.userAccount.userID.String(), worker.userAccount.remoteID.String(), accountInfos)
	if e != nil {
		log.WithError(e).Warnf("[AccountWorker %s] PollDM failed to update sync state in db", worker.userAccount.remoteID.String())
	}
	log.Infof("[AccountWorker %s] PollDM finished", worker.userAccount.remoteID.String())
}

func (worker *AccountWorker) dmNotSeen(event twitter.DirectMessageEvent) bool {
	return worker.lastDMseen < event.ID
}

// SendDM delivers DM to Twitter endpoint and give back Twitter's response to broker.
func (worker *AccountWorker) SendDM(order BrokerOrder) error {
	// make use of broker to marshal a direct message
	brokerPort := make(chan *broker.DMpayload)
	var brokerMessage *broker.DMpayload

	go worker.broker.ProcessOutDM(order, brokerPort)

	select {
	case brokerMessage = <-brokerPort:
		if brokerMessage.Err != nil {
			return brokerMessage.Err
		}
	case <-time.After(10 * time.Second):
		return errors.New("[SendDM] broker timeout")
	}

	// retrieve recipient's twitter ID from DM's screenName
	user, _, userErr := worker.twitterClient.Users.Show(&twitter.UserShowParams{
		ScreenName: brokerMessage.DM.Message.Target.RecipientScreenName,
	})
	if userErr != nil {
		brokerMessage.Response <- broker.TwitterDeliveryAck{
			Err:      true,
			Response: userErr.Error(),
		}
		return userErr
	}
	brokerMessage.DM.Message.Target.RecipientID = user.IDStr

	// deliver DM through Twitter API
	createResponse, _, errResponse := worker.twitterClient.DirectMessages.EventsCreate(brokerMessage.DM.Message)
	if errResponse != nil {
		brokerMessage.Response <- broker.TwitterDeliveryAck{
			Payload:  createResponse,
			Err:      true,
			Response: errResponse.Error(),
		}
		return errResponse
	}

	// give back Twitter's reply to broker for it finishes its job
	brokerMessage.Response <- broker.TwitterDeliveryAck{
		Payload: createResponse,
	}

	select {
	case brokerMessage = <-brokerPort:
		if brokerMessage.Err != nil {
			return brokerMessage.Err
		}
		return nil
	case <-time.After(10 * time.Second):
		return errors.New("[SendDM] broker timeout")
	}
}

// getAccountName returns Twitter account screen name given a Twitter account ID
// screen name is retrieve either from worker's cache or Twitter API
// returns empty string if it fails.
func (worker *AccountWorker) getAccountName(accountID string) (accountName string) {
	ID, err := strconv.ParseInt(accountID, 10, 64)
	if err == nil {
		var inCache bool
		if accountName, inCache = worker.usersScreenNames[ID]; !inCache {
			users, _, err := worker.twitterClient.Users.Lookup(&twitter.UserLookupParams{UserID: []int64{ID}})
			if err == nil && len(users) > 0 {
				accountName = users[0].ScreenName
				(*worker).usersScreenNames[ID] = accountName
			}
		}
		return accountName
	}
	return
}

func (worker *AccountWorker) saveErrorState(infos map[string]string, err string) error {

	// ensure errors data fields are present
	if _, ok := infos[lastErrorKey]; !ok {
		infos[lastErrorKey] = ""
	}
	if _, ok := infos[dateFirstErrorKey]; !ok {
		infos[dateFirstErrorKey] = ""
	}
	if _, ok := infos[dateLastErrorKey]; !ok {
		infos[dateLastErrorKey] = ""
	}
	if _, ok := infos[errorsCountKey]; !ok {
		infos[errorsCountKey] = "0"
	}

	// log last error
	infos[lastErrorKey] = "Twitter connection failed : " + err
	log.Warnf("Twitter connection failed for remote identity %s : %s", worker.userAccount.remoteID, err)
	// increment counter
	count, _ := strconv.Atoi(infos[errorsCountKey])
	count++
	infos[errorsCountKey] = strconv.Itoa(count)

	// update dates
	lastDate := time.Now()
	var firstDate time.Time
	firstDate, _ = time.Parse(time.RFC3339, infos[dateFirstErrorKey])
	if firstDate.IsZero() {
		firstDate = lastDate
	}
	infos[dateFirstErrorKey] = firstDate.Format(time.RFC3339)
	infos[dateLastErrorKey] = lastDate.Format(time.RFC3339)

	// check failuresThreshold
	if lastDate.Sub(firstDate)/time.Hour > failuresThreshold {
		// TODO : disable remote identity and send nats message to identities_worker
	}

	// udpate UserIdentity in db
	return worker.broker.Store.UpdateRemoteInfosMap(worker.userAccount.userID.String(), worker.userAccount.remoteID.String(), infos)

}

// sort interface
type ByAscID []twitter.DirectMessageEvent

func (bri ByAscID) Len() int {
	return len(bri)
}

func (bri ByAscID) Less(i, j int) bool {
	return bri[i].ID < bri[j].ID
}

func (bri ByAscID) Swap(i, j int) {
	bri[i], bri[j] = bri[j], bri[i]
}
