package rest_api

import (
	log "github.com/Sirupsen/logrus"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func StartProxy(config ProxyConfig) {

	mux := http.NewServeMux()

	for path, target := range config.Routes {
		mux.Handle(path, httputil.NewSingleHostReverseProxy(&url.URL{
			Scheme: "http",
			Host:   target,
		}))
	}

	addr := config.Host + ":" + config.Port
	log.Printf("HTTP proxy listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))

	return
}

type ProxyConfig struct {
	Host   string            `mapstructure:"host"`
	Port   string            `mapstructure:"port"`
	Routes map[string]string `mapstructure:"routes"`
}
