# Caliopen frontend

**Important note:**

Please refer to global documentation on [readthedocs](http://caliopen.readthedocs.io/en/latest/) the following documentation wil not be maintained anymore. Some informations are still useful.

This subtree is meant for building and serving CaliOpen frontend.

- serving html, js and static files
- build web application
- build or run desktop applications
- build or run mobile devices applications

## Prerequisite

- [yarn](https://yarnpkg.com/en/docs/install)

_(make sure you have an up-to-date version)_

## Usage (production ready)

This will install dependencies then start the web server. Depending you custom options, you will be
able to access to Caliopen interface via http://0.0.0.0:4000

```
export NODE_ENV=production
yarn
bin/server
```

### Web Server Options

You can set instance config via environment variables and a json file:

```
export CALIOPEN_API_HOSTNAME=api.foobar.tld
```

```
NODE_ENV=production bin/server --config=<path-to-file>.json
```

The default variables are set in `config/server.default.js`.
The environment variables are set in `config/server.env-var.js`.

We **strongly** recommand to overide `CALIOPEN_COOKIE_SECRET` and `CALIOPEN_SEAL_SECRET`.

The precedence of config definitions:

> env var > custom file > defaults

Config for the client is not dynamic and can be done **in release** phase (see below).

## Release

```
NODE_ENV=production yarn release
```

This will build the different packages to run Caliopen web server in the dist directory.

### Client options

Due to webpack restrictions, config can be pass using environment variables only.

The default variables and environment variables definitions are set in `config/client.default.js`.

We **strongly** recommand to overide `CALIOPEN_PIWIK_SITE_ID`.

## Code architecture

All the things related to react follows [this guide](https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1#.rwqbggzgf) in `src` folder.

Each build target has its folder:

- server (the web server providing html pages thanks to SSR and the javascript browser client)
- electron (for linux, macos and windows)

The `index.html` is generated using webpack and a `template`.

And each target has its `webpack` config.

## Code quality

In order to make sure the code is relatively valid and consistent, some linting and formating checks are done on CI.
You can run `yarn lint` to check if valid before sending a pull request.
To fix automatically your code, run those 2 commands (or use eslint and prettier in your dev env):

```
yarn lint:js --fix
yarn prettier --write .
```
