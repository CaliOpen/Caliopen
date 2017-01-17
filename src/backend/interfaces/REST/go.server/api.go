package rest_api

import (
	"net/http"
	log "github.com/Sirupsen/logrus"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.main/backends/store/cassandra"
)

type apiHandler struct {
	backend *store.CassandraBackend
}

func StartServer() {

	//db initialization
	db := &store.CassandraBackend{}
	err := db.Initialize(map[string]interface{}{
		"hosts": []string{"127.0.0.1"},
		"keyspace": "caliopen",
		"consistency_level": 1,
	})

	if err != nil {
		log.WithError(err).Fatal("DB initialization failed")
	}

	mux := http.NewServeMux()
	mux.Handle("/", &apiHandler{db})

	log.Println("GO REST API server listening on port :6544")
	log.Fatal(http.ListenAndServe("127.0.0.1:6544", mux))
}

func StopServer() {

}

func (h *apiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		log.Error("username not provided")
		w.Header().Set("content-type","application/json; charset=utf-8")
		w.Write([]byte(`{"available": false}`))
		return
	}
	if UsernameLookup(username, h.backend){
		w.Header().Set("content-type","application/json; charset=utf-8")
		w.Write([]byte(`{"available": false}`))
		return
	}

	w.Header().Set("content-type","application/json; charset=utf-8")
	w.Write([]byte(`{"available": true}`))
	return
}

func UsernameLookup(username string, db *store.CassandraBackend) bool {
	lookup := escapeUsername(username)
	found := map[string]interface{}{}
	err := db.Session.Query(`SELECT COUNT(*) FROM user_name WHERE name = ?`, lookup).MapScan(found)
	if err != nil {
		log.WithError(err).Infof("username lookup error : %v", err)
		return true
	}
	if found["count"].(int64) != 0 {
		return true
	}
	return false
}

func escapeUsername(username string) string {
	// TODO : do we need to implement an algorithm against injections ?
	return username
}