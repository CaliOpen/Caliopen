# Native installation of Caliopen

## Go developments for CaliOpen

As Caliopen use a mono repository structure and use many languages,
the setup for a go development environment need some specific considerations.

### A specific GOPATH is privilegied

We use [govendor](https://github.com/kardianos/govendor) for external dependencies
it's better to have a specific GOPATH to develop on Caliopen.

```
mkdir $HOME/caliopen
cd $HOME/caliopen
for i in bin pkg src/github.com/CaliOpen
do
	mkdir -p caliopen/$i
done

cd src/github.com/CaliOpen
git clone https://github.com/CaliOpen/Caliopen

# DO NOT FORGET TO SETUP AS a distinct GOPATH
export GOPATH=$HOME/caliopen

```

NOTE: you will need to setup frequently this GOPATH, add an alias into your shell, for example for bash or zsh:

```
alias tocaliopen="export GOPATH=$HOME/caliopen; cd $GOPATH/src/github.com/CaliOpen"
```

### Setup external dependencies

Using govendor external dependencies will be fetch into your Caliopen repository

```
cd $GOPATH/src/github.com/CaliOpen/Caliopen
go get -u github.com/kardianos/govendor
govendor sync -v
```

Directory `$GOPATH/src/github.com/CaliOpen/Caliopen/src/backend/vendor` contain
all external golang dependencies for all CaliOpen services written in this
language.

### Build

Refer to devtools/package.yaml file for services in go language and their
build command

For example:

```
go build github.com/CaliOpen/Caliopen/src/backend/protocols/go.smtp/cmd/caliopen_lmtpd
```

Will produce a caliopen_lmtp binary from where this command is launched inside the $GOPATH

## Python developments for CaliOpen

You will need a local virtualenv than can be setup using the `devtools/setup-virtualenv.sh` script.

To start the apiv1 service and develop on it, you can use the pyramid pserve command to start a local
http server that will be restarted each time you update part of the code.

```
cd src/backend
pserve configs/caliopen-api.docker.ini --reload
```
