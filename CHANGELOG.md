# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Always link participant to contact in a draft when contact exists (ensure message can be encrypted)

### Changed

- On quick reply, «Enter» will not send draft anymore, it must be CTRL+Enter.
- Quick reply is now multilines.
- Use message's excerpt in search results instead of garbled highlights
- Move vcard file import route on apiv2 to use contact uniqueness and lookups principles
- clean recovery_email structure when deleting an user account

### Fixed

- Default locale saved on account creation
- Responsiveness for the «new device page»
- BSOD while including regexp special chars in search query

## [0.20] \<Unreleased>

### Changed

- Disable «Take a tour» which is not working properly
- Disable the send button on quick draft when empty (thanks Sebbaz).
- Look and feel of GPG buttons which look like disabled.

### Fixed

- BSOD when changing identity in draft when no recipients (thanks peha)
- Many encoding issues during mail delivery
- Participants algorithm edge case
- Discussion last message sort better
- Index user contact without alias using a workaround to bad core/mixin classes design
- Addresses emails parsing failed sometimes with strange values
- Process better invalid or missing data and encoding problems in incoming message

## [0.20.0] 2019-05-15

### Added

- Validation of twitter username in contact edition
- Address (and protocol) selection in a 1-to-1 discussion
- Activate links in plain text messages.
- Handle client crashes and provide a link to report an issue on https://feedback.caliopen.org

### Changed

- Disable draft form in case there is no selected identity
- Facebook username is no more available in contact edition
- In a draft, switch identity will change the protocol of all recipients as well
- Disable contact import
- Do not display private key details, allow "download" instead.
- Providers buttons are available according to backend configuration (api: `/api/v2/providers`)

### Fixed

- Simple detection of PGP inline message
- Apiv2 create and delete contacts does not use `user.shard_id`
- Better logging for apiv2 and mq-worker
- Do not fail if ContactLookup raise a NotFound
- Twitter nick not displayed on contact book
- Select Twitter identity according to parent message on a new draft
- Show at least 1 participant per discussion on timeline
- Send a quick draft by pressing «Enter» and display a spinner

## [0.18.2] 2019-04-26

### Fixed

- signup does not authenticate and crash
- hardcoded references to "alpha.caliopen.org" in client

## [0.18.1] 2019-04-26

### Changed

- Better display of message's participants
- Fix attachment visibility
- Raise an explicit error on duplicate message for better processing
- Validate better email address when cleaning it
- Better oauth token validation

### Fixed

- Attachments visibility, it displays a warning if the message has been encrypted

## [0.18.0] 2019-04-23

### Fixed

- render form after draft deletion
- Reply encrypted messages
- Hide "load" more button when all messages are displayed
- Display decryption error message
- Glitches on encrypted mails
- Display facebook names on contact book

### Added

- Send and receive text/plain MIME messages
- Show full date on Hover
- Suggest Twitter handles in draft form

## [0.17.0] 2019-03-21

### Added

- End to end PGP encryption/decryption.
- When user adds an external account, external identity is added to user's contact card
- Test for imap worker, twitter worker and identities worker
- Actions for instant messages (delete, reply …) and tag list where missing
- PWA: add to home screen
- PWA: basic offline capabilities
- Search when click on tags (basic search)
- Verify device by mail

### Fixed

- Fix chronological order of messages in discussion scene
- Better responsiveness on small screens for timeline & discussion & logo
- Better responsiveness on small screens for dropdowns
- inversion en/fr for some translations
- BSOD on draft view in case there is no author (for example after remote identity deletion)
- Last messages not visible in case the discussion has been openned
- Sync contact associated to the user when editing in the contact book
- Accept only Private Key in user account

### Changed

- Remove device's locations field (IP definition) that wasn't saved and has no effects for now

## [0.16.0] 2019-02-25

### Added

- Handle lost authentication, redirect signin
- A simple view with draft messages
- Display the discussion related to the selected participants of a draft
- Compute an experimental different PI structure for message entity
- A caliopen_data python package for caliopen data manipulation
- A machine learning model for message automatic tagging
- Create an RFC 3156 compatible mime structure for PGP encrypted sent email
- Add an API route to find if a discussion exist for a list of participants
- Ignore already imported message

### Changed

- Move link external accounts to user menu
- Smaller font for desktop
- Use white color for plain text buttons
- Refactor hover and active colors for buttons
- Display a progress bar when downloading an attachment
- New calcul for Privacy Index
- Take A Tour has been moved in the new menu «Help & Info»
- Display related emails for a PGP public key
- Compute related discussion only when the message is sent
- Better discussion match if any participant is a known contact
- Reworked deeply job dispatching logic for protocol workers

### Fixed

- Bad redirection when canceling contact creation
- Add spaces between buttons in contact edit & contact association pages
- Unable to download an attachment due to missing request's headers

## [0.15.2] 2019-01-23

### Fixed

- Many fixes on remote identities workers (imap, twitter) tested on production

## [0.15.1] 2019-01-22

### Fixed

- BSOD on discussion when contacts not yet loaded

## [0.15.0] 2019-01-15

### Added

- When an user authenticate we issue a device.login event
- Add a contact from a discussion
- Privacy Policy page available at https://alpha.caliopen.org/privacy-policy.html

### Fixed

- typos on English catalog (thanks octplane)
- Existing device are found better, lead to less untrusted device for user
- Click on contact's title "input" submits the form
- Empty contact book even when user has a contact (always actually)
- Route /discussion/{discussion_id} to retrieve one discussion
- `unread_count` in discussions list

### Changed

- Rework how privacy features are declared and managed
- Change how a discussion hash is build, take contact_id as better key

## [0.14.0] 2018-12-19

### Added

- special group user contact in contact-book
- Toggle show spam
- Placeholder when loading Timeline
- Messages de-duplication when importing or re-importing from external accounts

### Fixed

- Timeline responsiveness (dates & action bar)
- Display last protocol used for a discussion in the timeline
- Automatic set read when displaying a message
- participants added from suggestions always define `email` protocol
- More permissive protocol validation in draft according to identities

### Changed

- Timeline colors


## [0.13.2] 2018-12-11

### Added

- Switch identity, send twitter DM, validation…
- Support new dm twitter notification

### Fixed

- Crash when replying a message.
- Help button has no effects
- Unable to change password
- Better layout for twitter DM
- Avatar size in tabs for twitter DM
- Splash screen initialization after reconnect

## [0.13.1] 2018-12-05

### Fixed

- BSOD when selecting contact
- All messages detected as Twitter DM
- Missing user_identity when sending the reset password notification
- Legacy protocol values are considered as valid

## [0.13.0] 2018-11-30

### Added

- API to manage cryptographic public keys related to a contact
- API to list known remote identity providers
- Create remote identity for gmail and twitter using Oauth mechanisms
- A new worker to fetch twitter direct messages
- Support touch scroll on navigation tabs
- Manage public keys of a contact
- App loader splash screen

### Changed

- Brand new UI
- Message Timeline replaced by Discussion Timeline
- IM address for a contact is more permisive

### Removed

- Sidescreen on small screen
- In discussion messages grouped by date

### Fixed

- Translation of new device screen in English

## [0.12.3] 2018-10-26

### Fixed

- Manage better how to declare an user index on signup
- Index contact and message with correct user_id

### Changed

- Build go images with a vendor sync and with CA certificates for TLS connection

## [0.12.2] 2018-10-15

### Fixed

- /suggest apiv2 route use user.shard_id index not user.user_id
- message python object use user not user_id

## [0.12.1] 2018-10-04

### Fixed

- Share an index for many users, scalibility of elasticsearch does not work using old scheme


### Added

- Add an email or a social identity to a contact trigger PGP key discovery process
- A connection is possible per device

### Changed

- prevent invalidation of whole discussion during scroll
- LocalIdentities and RemoteIdentities have been merged into a new UserIdentity object
- group discussion by list or all participants
- API output more informations on discussions

### Fixed

- message sort on "Load More" in discussion view
- revert mis-deleted signup and recovery mail links

## [0.11.2] 2018-07-16

### Fixed

- load more doesn't load correctly when filter has been changed
- prevent signin until JS is fully loaded, previously a json shows up with informations about a fake device.
- unlock correctly syncing state after a fetch failure
- safer parsing of email with ',' or '\r' character

### Changed

- remove unused safe/public/unsafe login buttons

## [0.11.1] 2018-07-12

### Added

- explain how to authorize retrieve of an imap gmail account

### Fixed

- do not try to parse a null date_sort
- ensure to not retrieve credentials when patching a remote identity
- RawMessage.get raise correctly
- request body must be utf8 encoded correctly, do not use it for the moment

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
