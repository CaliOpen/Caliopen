package rest_api

import (
	log "github.com/Sirupsen/logrus"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func StartProxy() {

	mux := http.NewServeMux()

	goHandler := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: "http",
		Host:   "127.0.0.1:6544",
	})

	pyramidHandler := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: "http",
		Host:   "127.0.0.1:6543",
	})

	mux.Handle("/api/v2/", goHandler)

	//everything else goes to pyramid for now
	mux.Handle("/", pyramidHandler)

	log.Println("HTTP proxy listening on 127.0.0.1:3141") // guess why this port # ?
	log.Fatal(http.ListenAndServe("127.0.0.1:3141", mux))

	return
}
