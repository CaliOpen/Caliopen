FROM golang
 

RUN go get -u github.com/kardianos/govendor
RUN go install github.com/kardianos/govendor

ADD . /go/src/github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server
WORKDIR /go/src/github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server

RUN govendor sync
RUN go build github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server/cmd/caliopen_rest


# ENTRYPOINT /go/src/github.com/CaliOpen/CaliOpen/src/backend/interfaces/REST/go.server/caliopen_rest -c caliopen-api.docker.yaml serve

ENTRYPOINT /bin/bash

EXPOSE 3141
