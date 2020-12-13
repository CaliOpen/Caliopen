/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package cmd

import (
	"errors"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/interfaces/REST/go.server"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/index/elasticsearch"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/store/cassandra"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/store/vault"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.main/facilities/REST"
	"github.com/CaliOpen/Caliopen/src/backend/protocols/go.imap"
	"github.com/CaliOpen/Caliopen/src/backend/protocols/go.smtp"
	log "github.com/Sirupsen/logrus"
	"github.com/gocql/gocql"
	"github.com/nats-io/go-nats"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"net/http"
	"os"
)

type CmdConfig struct {
	rest_api.APIConfig
	rest_api.IndexConfig
	rest_api.ProxyConfig
}

var (
	cfgPath           string
	apiCfgFile        string
	lmtpCfgFile       string
	imapWorkerCfgFile string
	apiConf           CmdConfig
	lmtpConf          caliopen_smtp.SMTPConfig
	imapWorkerConf    imap_worker.WorkerConfig

	// RootCmd represents the base command when called without any subcommands
	RootCmd = &cobra.Command{
		Use:   "gocaliopen",
		Short: "Caliopen CLI to interact with stack",
		Long: `gocaliopen needs two of Caliopen's config files : caliopen-go-api_dev.yaml and caliopen-go-lmtp_dev.yaml.
It loads them from within directory specified with flag --confPath, or if path/filenames are specified with the --apiConf and --lmtpConf.
gocaliopen subcommands could interact with
	- store (Cassandra)
	- index (Elasticsearch)
	- message queue (NATS)
	- cache (Redis)
	- caliopen REST facility	
	- apiV1
	- apiV2
	- lmtpd
	- caliopen notification facility
	- email broker	`,
	}
)

const __version__ = "0.23.0"

func init() {
	cobra.OnInitialize(initConfig)

	RootCmd.PersistentFlags().StringVar(&cfgPath, "confPath", "", "Path to seek the two mandatory config files: apiv2.yaml and lmtp.yaml")
	RootCmd.PersistentFlags().StringVar(&apiCfgFile, "apiConf", "", "Caliopen's API config file")
	RootCmd.PersistentFlags().StringVar(&lmtpCfgFile, "lmtpConf", "", "Caliopen's lmtpd config file")
	RootCmd.PersistentFlags().StringVar(&imapWorkerCfgFile, "imapWorkerConf", "", "Imap worker config file")
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

// initConfig reads in config files and ENV variables if set.
func initConfig() {
	apiCfg := viper.New()
	lmtpCfg := viper.New()
	imapWorkerCfg := viper.New()

	if cfgPath != "" {
		// Use path from the flag
		apiCfg.AddConfigPath(cfgPath)
		lmtpCfg.AddConfigPath(cfgPath)
		imapWorkerCfg.AddConfigPath(cfgPath)
	} else {
		// set defaults to current dir
		apiCfg.AddConfigPath(".")
		lmtpCfg.AddConfigPath(".")
		imapWorkerCfg.AddConfigPath(".")
	}

	if apiCfgFile != "" {
		// Use config file name and path from the flag.
		apiCfg.SetConfigFile(apiCfgFile)
	} else {
		apiCfg.SetConfigName("apiv2")
	}

	if lmtpCfgFile != "" {
		// Use config file name and path from the flag.
		lmtpCfg.SetConfigFile(lmtpCfgFile)
	} else {
		lmtpCfg.SetConfigName("lmtp")
	}

	if imapWorkerCfgFile != "" {
		// Use config file name and path from the flag.
		imapWorkerCfg.SetConfigFile(imapWorkerCfgFile)
	} else {
		imapWorkerCfg.SetConfigName("imapworker")
	}

	// read in environment variables that match
	apiCfg.AutomaticEnv()
	lmtpCfg.AutomaticEnv()
	imapWorkerCfg.AutomaticEnv()

	if err := apiCfg.ReadInConfig(); err != nil {
		log.WithError(err).Fatalf("can't load api config file %s", apiCfgFile)
	}
	if err := apiCfg.Unmarshal(&apiConf); err != nil {
		log.WithError(err).Fatalf("can't parse api config file %s", apiCfgFile)
	}

	if err := lmtpCfg.ReadInConfig(); err != nil {
		log.WithError(err).Fatalf("can't load lmtp config file %s", lmtpCfgFile)
	}
	if err := lmtpCfg.Unmarshal(&lmtpConf); err != nil {
		log.WithError(err).Fatalf("can't parse lmtp config file %s", lmtpCfgFile)
	}

	if err := imapWorkerCfg.ReadInConfig(); err != nil {
		log.WithError(err).Warn("can't load imapworker config file %s", imapWorkerCfgFile)
	}
	if err := imapWorkerCfg.Unmarshal(&imapWorkerConf); err != nil {
		log.WithError(err).Warn("can't parse imapworker config file %s", imapWorkerCfgFile)
	}
}

// getStoreFacility reads configuration and tries to connect to a store
// It returns a handler to make use of store facility
// For now, only returns a CassandraBackend
func getStoreFacility() (Store *store.CassandraBackend, err error) {
	switch apiConf.BackendName {
	case "cassandra":
		c := store.CassandraConfig{
			Hosts:        apiConf.BackendConfig.Settings.Hosts,
			Keyspace:     apiConf.BackendConfig.Settings.Keyspace,
			Consistency:  gocql.Consistency(apiConf.BackendConfig.Settings.Consistency),
			SizeLimit:    apiConf.BackendConfig.Settings.SizeLimit,
			WithObjStore: true,
			UseVault:     apiConf.BackendConfig.Settings.UseVault,
			HVaultConfig: vault.HVaultConfig{
				apiConf.BackendConfig.Settings.VaultSettings.Url,
				apiConf.BackendConfig.Settings.VaultSettings.Username,
				apiConf.BackendConfig.Settings.VaultSettings.Password,
			},
		}
		c.Endpoint = apiConf.BackendConfig.Settings.ObjStoreSettings.Endpoint
		c.AccessKey = apiConf.BackendConfig.Settings.ObjStoreSettings.AccessKey
		c.SecretKey = apiConf.BackendConfig.Settings.ObjStoreSettings.SecretKey
		c.RawMsgBucket = apiConf.BackendConfig.Settings.ObjStoreSettings.Buckets["raw_messages"]
		c.AttachmentBucket = apiConf.BackendConfig.Settings.ObjStoreSettings.Buckets["temporary_attachments"]
		c.Location = apiConf.BackendConfig.Settings.ObjStoreSettings.Location

		//TODO: add a conf file for gocli.
		if c.UseVault {
			c.Url = apiConf.BackendConfig.Settings.VaultSettings.Url
			c.Username = "gocli"
			c.Password = "gocli_weak_password"
		}

		Store, err = store.InitializeCassandraBackend(c)
		if err != nil {
			return nil, err
		}
	}
	return
}

// getIndexFacility reads configuration and tries to connect to an index
// It returns a handler to make use of index facility
// For now, only returns an ElasticSearchBackend
func getIndexFacility() (Index *index.ElasticSearchBackend, err error) {
	switch apiConf.APIConfig.IndexConfig.IndexName {
	case "elasticsearch":
		c := index.ElasticSearchConfig{
			Urls: apiConf.APIConfig.IndexConfig.Settings.Hosts,
		}
		Index, err = index.InitializeElasticSearchIndex(c)
		if err != nil {
			return nil, err
		}
	default:
		return nil, errors.New("unknown index")
	}
	return
}

// getMsgSystemFacility reads configuration and tries to connect to a messages broker
// It returns a handler to make use of facility
// For now, only returns an Nats conn
func getMsgSystemFacility() (MsgSys *nats.Conn, err error) {
	MsgSys, err = nats.Connect(apiConf.APIConfig.NatsConfig.Url)
	if err != nil {
		return nil, err
	}
	return
}

// getCacheFacility reads configuration and tries to connect to a memory cache
// It returns a handler to make use of facility
// For now, only returns a RedisBackend
/*
func getCacheFacility() (Cache *cache.RedisBackend, err error) {
	Cache, err = cache.InitializeRedisBackend(CacheConfig(apiConf.APIConfig.CacheSettings))
	if err != nil {
		return nil, err
	}
	return
}
*/

// getAPIConnection pings API1 and API2 connections and returns URLs from configuration file
// OK is false if at least one API is not responding
func getAPIConnection() (API1, API2 string, OK1, OK2 bool) {
	API1 = apiConf.ProxyConfig.Routes["/"]
	API2 = apiConf.ProxyConfig.Routes["/api/v2/"]
	if _, err := http.Head("http://" + API1); err == nil {
		OK1 = true
	}
	if _, err := http.Head("http://" + API2); err == nil {
		OK2 = true
	}
	return
}

// getAPI2Facility reads configuration and initializes RESTfacility interface
// to expose all its functions
func getRESTFacility() (API2 *REST.RESTfacility, err error) {
	var MsgSys *nats.Conn
	MsgSys, err = getMsgSystemFacility()
	if err != nil {
		return nil, err
	}

	caliopenConf := CaliopenConfig{
		RESTstoreConfig: RESTstoreConfig{
			BackendName:  apiConf.APIConfig.BackendConfig.BackendName,
			Hosts:        apiConf.APIConfig.BackendConfig.Settings.Hosts,
			Keyspace:     apiConf.APIConfig.BackendConfig.Settings.Keyspace,
			Consistency:  apiConf.APIConfig.BackendConfig.Settings.Consistency,
			SizeLimit:    apiConf.APIConfig.BackendConfig.Settings.SizeLimit,
			ObjStoreType: apiConf.APIConfig.BackendConfig.Settings.ObjStoreType,
		},
		RESTindexConfig: RESTIndexConfig{
			IndexName: apiConf.APIConfig.IndexConfig.IndexName,
			Hosts:     apiConf.APIConfig.IndexConfig.Settings.Hosts,
		},
		NatsConfig: NatsConfig{
			Url:            apiConf.APIConfig.NatsConfig.Url,
			OutSMTP_topic:  apiConf.APIConfig.OutSMTP_topic,
			Contacts_topic: apiConf.APIConfig.Contacts_topic,
		},
		CacheConfig: CacheConfig{
			Host:     apiConf.APIConfig.CacheSettings.Host,
			Password: apiConf.APIConfig.CacheSettings.Password,
			Db:       apiConf.APIConfig.CacheSettings.Db,
		},
		NotifierConfig: NotifierConfig{
			AdminUsername: apiConf.APIConfig.NotifierConfig.AdminUsername,
			BaseUrl:       apiConf.APIConfig.NotifierConfig.BaseUrl,
			TemplatesPath: apiConf.APIConfig.NotifierConfig.TemplatesPath,
		},
	}
	caliopenConf.RESTstoreConfig.Endpoint = apiConf.APIConfig.BackendConfig.Settings.ObjStoreSettings.Endpoint
	caliopenConf.RESTstoreConfig.AccessKey = apiConf.APIConfig.BackendConfig.Settings.ObjStoreSettings.AccessKey
	caliopenConf.RESTstoreConfig.SecretKey = apiConf.APIConfig.BackendConfig.Settings.ObjStoreSettings.SecretKey
	caliopenConf.RESTstoreConfig.Location = apiConf.APIConfig.BackendConfig.Settings.ObjStoreSettings.Location
	caliopenConf.RESTstoreConfig.Buckets = apiConf.APIConfig.BackendConfig.Settings.ObjStoreSettings.Buckets

	API2 = REST.NewRESTfacility(caliopenConf, MsgSys)

	return API2, nil
}

func getNotificationsFacility() { /*TODO*/ }

func getLMTPFacility() { /*TODO*/ }
