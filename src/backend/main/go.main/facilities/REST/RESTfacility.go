// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/cache/redis"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/index/elasticsearch"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/store/cassandra"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/facilities/Notifications"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/nats-io/go-nats"
	"github.com/tidwall/gjson"
	"io"
)

type (
	RESTservices interface {
		UsernameIsAvailable(string) (bool, error)
		LocalsIdentities(user_id string) (identities []LocalIdentity, err error)
		SuggestRecipients(user_id, query_string string) (suggests []RecipientSuggestion, err error)
		GetSettings(user_id string) (settings *Settings, err error)
		//contacts
		CreateContact(contact *Contact) error
		RetrieveContacts(filter IndexSearch) (contacts []*Contact, totalFound int64, err error)
		RetrieveContact(userID, contactID string) (*Contact, error)
		UpdateContact(contact, oldContact *Contact, update map[string]interface{}) error
		PatchContact(patch []byte, userID, contactID string) error
		DeleteContact(userID, contactID string) error
		ContactIdentities(user_id, contact_id string) (identities []ContactIdentity, err error)
		//messages
		GetMessagesList(filter IndexSearch) (messages []*Message, totalFound int64, err error)
		GetMessage(user *UserInfo, message_id string) (message *Message, err error)
		SendDraft(user_id, msg_id string) (msg *Message, err error)
		SetMessageUnread(user *UserInfo, message_id string, status bool) error
		GetRawMessage(raw_message_id string) (message []byte, err error)
		//attachments
		AddAttachment(user *UserInfo, message_id, filename, content_type string, file io.Reader) (attachmentURL string, err error)
		DeleteAttachment(user *UserInfo, message_id string, attchmtIndex int) error
		OpenAttachment(user_id, message_id string, attchmtIndex int) (contentType string, size int, content io.Reader, err error)
		//tags
		RetrieveUserTags(user_id string) (tags []Tag, err CaliopenError)
		CreateTag(tag *Tag) CaliopenError
		RetrieveTag(user_id, tag_id string) (tag Tag, err CaliopenError)
		UpdateTag(tag *Tag) CaliopenError
		PatchTag(patch []byte, user_id, tag_name string) CaliopenError
		DeleteTag(user_id, tag_name string) CaliopenError
		UpdateResourceTags(user *UserInfo, resourceID, resourceType string, patch []byte) CaliopenError
		//search
		Search(IndexSearch) (result *IndexResult, err error)
		//users
		PatchUser(user_id string, patch *gjson.Result, notifier Notifications.Notifiers) error
		RequestPasswordReset(payload PasswordResetRequest, notifier Notifications.EmailNotifiers) error
		ValidatePasswordResetToken(token string) (session *Pass_reset_session, err error)
		ResetUserPassword(token, new_password string, notifier Notifications.EmailNotifiers) error
	}
	RESTfacility struct {
		store              backends.APIStorage
		index              backends.APIIndex
		Cache              backends.APICache
		nats_conn          *nats.Conn
		nats_outSMTP_topic string
	}
)

func NewRESTfacility(config CaliopenConfig, nats_conn *nats.Conn) (rest_facility *RESTfacility) {
	rest_facility = new(RESTfacility)
	rest_facility.nats_conn = nats_conn
	rest_facility.nats_outSMTP_topic = config.NatsConfig.OutSMTP_topic
	switch config.RESTstoreConfig.BackendName {
	case "cassandra":
		cassaConfig := store.CassandraConfig{
			Hosts:       config.RESTstoreConfig.Hosts,
			Keyspace:    config.RESTstoreConfig.Keyspace,
			Consistency: gocql.Consistency(config.RESTstoreConfig.Consistency),
		}
		if config.RESTstoreConfig.ObjStoreType == "s3" {
			cassaConfig.WithObjStore = true
			cassaConfig.OSSConfig.Endpoint = config.RESTstoreConfig.OSSConfig.Endpoint
			cassaConfig.OSSConfig.AccessKey = config.RESTstoreConfig.OSSConfig.AccessKey
			cassaConfig.OSSConfig.SecretKey = config.RESTstoreConfig.OSSConfig.SecretKey
			cassaConfig.OSSConfig.Location = config.RESTstoreConfig.OSSConfig.Location
			cassaConfig.OSSConfig.RawMsgBucket = config.RESTstoreConfig.OSSConfig.Buckets["raw_messages"]
			cassaConfig.OSSConfig.AttachmentBucket = config.RESTstoreConfig.OSSConfig.Buckets["temporary_attachments"]
		}
		backend, err := store.InitializeCassandraBackend(cassaConfig)
		if err != nil {
			log.WithError(err).Fatalf("Initalization of %s backend failed", config.RESTstoreConfig.BackendName)
		}
		rest_facility.store = backends.APIStorage(backend) // type conversion
	default:
		log.Fatalf("Unknown backend: %s", config.RESTstoreConfig.BackendName)
	}

	switch config.RESTindexConfig.IndexName {
	case "elasticsearch":
		esConfig := index.ElasticSearchConfig{
			Urls: config.RESTindexConfig.Hosts,
		}
		indx, err := index.InitializeElasticSearchIndex(esConfig)
		if err != nil {
			log.WithError(err).Fatalf("Initalization of %s index failed", config.RESTindexConfig.IndexName)
		}
		rest_facility.index = backends.APIIndex(indx) // type conversion
	default:
		log.Fatalf("Unknown index: %s", config.RESTindexConfig.IndexName)
	}

	cach, err := cache.InitializeRedisBackend(config.CacheConfig)
	if err != nil {
		log.WithError(err).Fatal("Initialization of Redis cache failed")
	}

	rest_facility.Cache = backends.APICache(cach) // type conversion

	return rest_facility
}
