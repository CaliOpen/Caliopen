# Repositories architecture

Below is our target repository structure.  
For now, all directories are not created, as some Caliopen's components are still missing or are not yet implemented.

### top level

```
├── doc     : (work in progress) all documentation for developers, administrators and users
├── infra   : (to be done) tools to manage and supervise Caliopen platform
├── src     : all source code goes here
└── devtools: scripts, fixtures and other tools to build development environment
```

### the `src` directory
Source code for Caliopen platform and clients applications.  
**NB**: Caliopen is not bind to a specific language : one may finds softwares components written in python, Go, C, java…

Caliopen is made of :

 * the *frontends* => applications that run on clients' devices : browsers, computers, smartphones…
 * the *backend* => the Caliopen platform that runs on servers.   

Here is our target architecture for `src` :

```
├── backend
│   ├── agents
│   ├── brokers
│   ├── configs
│   ├── components
│   ├── defs
│   ├── interfaces
│   ├── main
│   ├── protocols
│   ├── tests
│   └── tools
└── frontends
    ├── android_app
    ├── browser_extensions
    ├── ios_app
    └── web_application
```

## Code organization for the backend

#### `main` directory

The main application goes here. This is the entry point for the platform. From here, all relevant programs, servers and daemons are spawned, and core services/APIs are started.  
For now, there are 2 python packages : `main/py.main` and `main/py.storage`.  

To startup the Caliopen platform, run the command `main/startup`

#### `interfaces` directory

Public APIs consumed by frontends and clients applications over HTTP/HTTP2.  
Examples : REST server, gRPC server…  
For now, there is a REST python server (pyramid) into `interfaces/REST/py.server`

#### `brokers` directory

Brokers are program modules that offer services to parse/unparse and/or unmarshall/marshall objects between the formal external protocol of the sender and the formal internal protocol of Caliopen.  
Examples : email broker, sms broker, vcard broker…

#### `protocols` directory

Program modules that implement standard protocols to connect *Brokers* to external tiers.  
Examples : SMTP, XMPP…

#### `components` directory

Software components that add features to Caliopen by exposing services or procedures directly to
main processes.  
Each component can be enhanced thanks to a plugin architecture, as long as the plugin don't break
the component's contract.  
Some components could be distributed outside Caliopen as standalone packages.  
Examples : parsers, messages qualifiers (PI computing, importance computing), keys manager, DNS…

#### `configs` directory

Configuration files for every platform components.

#### `defs` directory (ie definitions)

Interfaces, objects and methods definitions.  
One finds here the « Single Source of Truth » to work with Caliopen's inner world.  
Examples : databases models, protobuf files, python packages for base classes, Go struct
definitions…

#### `agents` directory

Programs that run on-demand tasks and cron-jobs for main process and/or offer on-demand services to end-users.  
Example : credentials manager, notifier…

#### `tools` directory

Standalone programs to manage the backend and the databases outside the standard interfaces.  
Examples : caliopen CLI to import mailboxes…

#### `tests` directory

Test suits go there.

## Code organization for the frontends

#### `web_application` directory

All the code needed to render and to distribute the User Interface that runs into the browser. For now, it is a *Node/Express/React* application.

#### `ios_app` directory

User Interface application for iOS. (to be implemented)

#### `android_app` directory

User Interface application for android devices. (to be implemented)
