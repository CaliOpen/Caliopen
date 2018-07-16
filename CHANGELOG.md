# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- load more doesn't load correctly when filter has been changed
- prevent signin until JS is fully loaded, previously a json shows up with informations about a fake device.
- message sort on "Load More" in discussion view
- unlock correctly syncing state after a fetch failure

### Changed

- remove unused safe/public/unsafe login buttons

## [0.11.1] 2018-04-12

### Added

- explain how to authorize retrieve of an imap gmail account

### Fixed

- do not try to parse a null date_sort
- ensure to not retrieve credentials when patching a remote identity
- RawMessage.get raise correctly
- request body must be utf8 encoded correctly, do not use it for the moment

### Changed

- prevent invalidation of whole discussion during scroll

## [0.11.0] 2018-07-04

### Added

- client sign HTTP queries
- API v1 and v2 check signed ecdsa http queries, but only log result
- delete an user account
- API for remote identities management
- client can create an IMAP remote identities
- poll remote identities to fetch an IMAP source
- can use hashicorp vault to store sensible informations
- fetch list of messages surrounding a given message
- a go CLI to fix empty message participants

### Changed

- optimization, prevent timeline to fetch multiple times the API
- Internal email delivery is more reliable, with better error handling, reporting and logging.
- scroll better on messages list

### Fixed

- scrolls to specific message, and restore scroll positions when navigating between tabs.
- change parent of a draft has no effects
- sort messages of a discussion
- discussion might not be up to date after creating a draft
- sending two consecutives messages was failing when the second message is saved before clicking on the send button.
- contact lookup can reference a deleted contact, don't fail

## [0.10.1] 2018-05-18

### Fixed

- a discussion_id should not be removed when patching a draft
- bad device type mapping for smartphone devices, authentication wasn't possible
- read message are flagged correctly read
- search bar is more visible

## [0.10.0] 2018-05-14

### Added

- Confirmation is asked before deleting a message, a discussion or a contact
- Messages have new computed property : `date_sort`. Messages' list is sorted on.
- Basic support of new message's notifications
- Poller and worker for IMAP remote identities fetch in backend

### Changed

- in mobile view, draft form can toggle with an excerpt to not use half of the screen
- Power to the not found unicorn

### Fixed

- Make favicon accessible without authentication

## [0.9.2] 2018-04-12

### Fixed

- prevent button background color to change on hover when disabled
- The draft delete button was always disabled even when draft was saved
- The max file size was not rendered (attachments/contacts..)

## [0.9.1] 2018-04-05

### Fixed

- check if contact.title is null or undefined when displaying ContactBook

## [0.9.0] 2018-03-29

### Added

- Manage draft's attachements
- Download message's attachements
- Set context (safe, public, not safe) on signin (it has no effects yet)
- Multiple messages delete on Timeline
- Multiple messages' tags management on Timeline
- Device management first part: declare new device with an ecdsa key
- Backend notification base principle with a related API


### Changed
- Refactor vcard parsing logic to get more informations
- Contacts API are now v2
- Authenticate with a context and a device (known or a new one to declare)
- Better email body sanitization
- When updating a contact, compute it's new PI asynchronously

### Fixed

- Explain that the NSA joke is a joke using a `:)`

## [0.8.1] 2018-01-25

### Fixed

- messages filtered by status draft/sent/received wasn't up-to-date
- checkbox wasn't correctly checked in settings
- fix BSOD (Black Screen Of Death) when an author is not in user's contact book

## [0.8.0] 2018-01-19

### Added

- Tags management: user's tags, tags on messages and contacts
- add a `internal` tag to messages sent from the same instance than receiver

### Fixed

- trim spaces in username on signin page
- unable to load more messages on Timeline

## [0.7.0] 2017-12-22

### Added

- Timeline filter (all, received, sent, drafts)
- Add a is_received flag on message structure
- Add german translations
- Add take a tour for current features

### Changed

- Do not save the draft until body or participants is filled
- Move activity spinner to the top right of contact page
- Prevent double click on contact save

### Fixed

- Signout on mobile doesn't disconnect
- suggest participants fails if a contact has no emails
- Max body size of a request (import contact)
- Sort message by date sent for user's messages
- Settings can be saved when display delay is changed
- A draft still appears after been deleted
- Show correctly the message in reply on the current draft
- Notify when saving contact failed
- Refresh contacts after a deletion
- Get browsers' autofills on SigninForm

## [0.6.0] 2017-11-24

### Added

- Reset password
- do not force phone nnumber normalization, accept everything and try to normalize
- permit to set contact title on user input, do not compute it strictly

### Changed

- User's contact cannot be deleted anymore
- The name of the Timeline tab is now "Messages" instead of "Discussions"

### Fixed

- Do not close the dropdown when receiving new suggestions
- Disable send message when already sent and add visual feedback (spinner)
- Disable import contact button on uploading and add a spinner
- Save updated password strength after password modification
- Set max file size for contact import
- Efficient search highlights
- Access to /user/security route
- Contact's name consistency
- On editing/creating contact, disable submit button if form is untouched

## [0.5.5] 2017-11-13

### Added

- Reset password API
- In a draft, press comma or semicolon key to add a recipient
- Basic search in messages and contacts
- Delete a contact
- Change password

### Fixed

- In a draft to edit last recipient, pressing backspace does not remove last letter
- In a draft, click outside of recipient list add a recipient
- Unmarshal nested empty structures in go objects.
- Save updated password strength after password modification

## [0.5.4] 2017-11-03

### Fixed

- unmarshal nested empty structures in go objects
- ancestors_id always an array, even empty
- save a draft notify correctly


## [0.5.3] 2017-11-02

### Added

- Delete a message from Timeline
- Delete a draft
- Notify the user the draft is saved after a manual save

### Fixed

- Disable buttons send and save when draft is untouched
- ancestors_id empty array and not null

## [0.5.2] 2017-10-31

### Fixed

- piwik site id environment variable ok with client build #590
- lower case local identity lookup #589
- empty string instead of none for family name #587
- plain text body unescaped only #586
- enforce uuid validation in apiv2 #584

## [0.5.1] 2017-10-29

### Fixed

- fix sort in discussions
- support https in api query configuration
- Render correctly the frontend Server Side (%MARKUP% will not show up anymore)
- fix empty UUID on patch #574
- lmtp crash with invalid nats message #575
- attach correctly to same discussion first outbound message and its reply #566
- handle better invalid message unmarshalling #579

## [0.5.0] 2017-10-25

### Added

- create new contact
- the excerpt of the message in reply into draft form
- frontend custom settings for the instance and the running environment
- API to allow users to change their password, with email notification
- Compute first contact privacy features
- Permit to restrict registration to a whitelist of user recovery emails

## [0.4.0]

### Added

- Connect settings and apply
- The brand new Timeline
- Load more in the discussions
- API for importance level messages filtering
- API for full-text searches on messages & contacts
- Compute importance level v0 for inbound messages


### Changed

- Improve `PATCH` API
- Backend produces `excerpt` for messages.
- Backend produces plain or rich body using setting value
- Frontend: refactoring Dropdown

### Fixed

- Render tag list in contact book

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
- Compose in multiple tabs messages, not only one.
- Cross-browser `<select>` element styles.
- Refactor caliopen_main package for cleaner namespaces.
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
