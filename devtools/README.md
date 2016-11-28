# CaliOpen development tools

Here you will find tools for CaliOpen development. There is many possibles
scenarios for setup of an environment development, depending on what you
want to do.

# Development scenarios

## Client development

You will need a running API server where you can consume data, so we have a
[vagrant](https://vagrantup.com) box for you.

You can develop using the box, the code will be immediatly updated. The first compilation is a bit
long, up to 1 min. You can use tail to see when it's ready :

```
tail -f src/frontend/web_application/kotatsu.log
```

> [kotatsu] Serving your app on port 4000... //<- ready

Also you can develop locally using your normal practices:

```
cd src/frontend/web_application
npm install
npm start
```

Same as above, it's a bit long to compile. Running client on both vagrant locally will not work
since it uses the same port.


## Api development

at least 2 scenarios:

- running the vagrant box, it's a pserve with --reload option started
  in it, so your changes will immediatly update the api code.

- running in a python virtual environment with storage services running locally

## Backend development

It's better to run all storage services locally and develop inside a python virtual
environment for such development, at the moment.

# Setup vagrant box

You need to have virtualbox and vagrant installed on your machine.

Just run inside this directory a ``vagrant up`` command, and you will have a debian
VM running these services visible on your guest machine:

- 4025 for LMTP (ingest mail)
- 6543 for ReST API
- 4000 for the web client


# Setup local storage services

You need to have installed locally:
- cassandra (2.x series for the moment)
- elasticsearch (< 5.0)
- redis (any version)

Installation method depend on your habits, but elasticsearch and cassandra are just
java .jar files to launch. If your OS distribution doesn't support them, don't panic
if you have a jvm >= 7.x available.

We experiment many problems with cassandra and docker container (with persistent
data accros container restart), so we don't encourage it for running storage services.


