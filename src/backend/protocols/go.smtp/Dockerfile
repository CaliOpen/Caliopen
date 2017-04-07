FROM golang

RUN go get -u github.com/kardianos/govendor
RUN go install github.com/kardianos/govendor

ADD . /go/src/github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp
WORKDIR /go/src/github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp

RUN govendor sync -v
RUN govendor update +vendor
RUN go build github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp/cmd/caliopen_lmtpd

ENTRYPOINT /go/src/github.com/CaliOpen/CaliOpen/src/backend/protocols/go.smtp/caliopen_lmtpd serve

EXPOSE 2525
