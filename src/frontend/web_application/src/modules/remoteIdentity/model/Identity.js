export const IDENTITY_TYPE_REMOTE = 'remote';
export const REMOTE_IDENTITY_STATUS_ACTIVE = 'active';
export const REMOTE_IDENTITY_STATUS_INACTIVE = 'inactive';
export const PROVIDER_EMAIL = 'email';
export const PROVIDER_GMAIL = 'gmail';
export const PROVIDER_TWITTER = 'twitter';
export const PROVIDER_MASTODON = 'mastodon';

// XXX: should be in message module
export const PROTOCOL_EMAIL = 'email';
export const PROTOCOL_TWITTER = 'twitter';
export const PROTOCOL_MASTODON = 'mastodon';
// ---

/* eslint-disable camelcase */
export class Identity {
  constructor(props) {
    Object.assign(this, props);
  }

  display_name;

  credentials = {};

  identifier;

  infos = {};

  // FIXME: backend doen't have this info for now: usefull for remoteIdentForm display
  provider;

  protocol;

  status = REMOTE_IDENTITY_STATUS_INACTIVE;

  type = IDENTITY_TYPE_REMOTE;
}
