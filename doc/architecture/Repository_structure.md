# Repositories architecture

Below is our target repository structure.  
For now, all directories are not created, as some Caliopen's components are still missing or are not yet implemented.

### top level

```
├── doc     : (work in progress) all documentation for developers, administrators and users
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
│   ├── brokers
│   ├── configs
│   ├── components
│   ├── defs
│   ├── interfaces
│   ├── main
│   ├── protocols
│   └── tools
└── frontends
    └── web_application
```

## Code organization for the backend

#### `main` directory

This is main code for caliopen backend services for interacting with storage layers.
For now, there are 2 python packages : `main/py.main` and `main/py.storage` and 2 golang ones
`main/go.main` and `main/go.backends`

#### `interfaces` directory

Public APIs consumed by frontends and clients applications over HTTP/HTTP2.  
Examples : REST server…  

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

#### `tools` directory

Standalone programs to manage the backend and the databases outside the standard interfaces.  
Examples : caliopen CLI to import mailboxes…

## Code organization for the frontends

#### `web_application` directory

All the code needed to render and to distribute the User Interface that runs into the browser. For now, it is a *Node/Express/React* application.

#### Code guidelines

The actual code mainly follows this basic [React tutorial](http://www.robinwieruch.de/the-soundcloud-client-in-react-redux/) and uses this recommended [file structure](https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1#.4t2oi46lj).

The main folders in src/frontend are:

* **components**: UI components that will be moved to its own module
* **layouts**: components rendering the layouts (Page, Auth, SubLayout ...)
* **modules**: domain specific with business logic (it can contains components, services etc.)
* **scenes**: routed components (Timeline, Contact, ...)
* **services**: functions with no relations with react nor redux
* **store**: state management with redux (actions, reducers, selectors, middlewares)
* **styles**: configuration and shared scss functions
