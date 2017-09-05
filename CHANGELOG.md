# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] 2017-08-31

### Added
- A python package caliopen_pi to group all logic related to privacy index compute
- Add route `GET /v2/contacts/{contact_id}/identities` to search & retrieve identities from a contact.
- New scene components related to Settings layout
- New Importance Level range slider in tabs & alt navigation
- In compose, add subject input field when recipient uses an email
- Install postcss-loader and Autoprefixer (run by webpack)
- Add user settings storage and API for management (GET and PATCH /settings)
- Frontend can post draftID
- Messages have 2 bodies : plain + HTML.
- Only one body is returned to frontend for Message.
- HTML body is sanitized before output to frontend.
- MailMessages's subject decoded to always output an UTF-8 string.
- Index operations return after index has been fully updated
- API /v1/discussions returns messages ordered by last_messsage date_insert field.

### Changed
- Rename <Account...> layout and related scenes to <User...>
- Display notification if contact update failed
- support TAB for adding a participant to a discussion
- use participant suggestions API for a new message
- Handle 4xx errors when updating contact fails
- Compose in multiple tabs messages, not only one
- Cross-browser <select> element styles.
- Refactore caliopen_main package for cleaner namespaces
- Move tags API to V2. CRUD operations are now on routes /v2/tags
- Discussions creation from ingress messages are build from messages' external references.
- ingress & egress JSON payload are double validated by our API instead of only relying on swagger.

### Fixed
- Bad wording for message update failures
- Blink when composing a new message
- Inconsistent date format string across stack
- Bugs on patch operations (contact & messages)
- Missing 'title' property on the user's Contact card
- Elasticsearch inconsistent mapping

## [0.2.1] - 2017-07-04
### Added
- GET /identities/remotes/<identifier> route to fix issue #383
- add a docker compose for staging platform

## [0.2.0] - 2017-07-02
### Added
- Participants suggestion API
- Basic user remote identities API
- API for attachment management during draft composition
- Backend for outbound email message build with attachements
- Basic privacy features extraction and pi computation when processing inbound email
- PI attribute added to user, public_key, contact, message entities
- Contact vcard import API and client implementation
- Contact book plugged with API
- Tabbed navigation
- Messages of a discussion
- Add or reply save draft message
- Send a draft message
- Basic import of a contact book
- Add piwik, the analytics plateform for the alpha testing purpose


### Changed
- Remove any cassandra counters and secondary index usage
- Replace cassandra with scylladb in development stack
- Upgrade elasticsearch from 2.4 version to 5.x ones
- Network optimizations when loading the client
- Infinite scroll on the lists
- Display real contact book (previous was fake)


## [0.1.0] - 2017-05-07
### Added
- Initial release
- Basic inbound email processing using NATS as message queue broker
- Contact API
- Message API
- Timeline build on basic discussion structure
- development CLI with basic commands to manage storage and load fixtures
- docker compose development stack
- Account creation
- Basic devices management
- Basic tags management
