/* eslint-disable camelcase */

export const PROTOCOL_EMAIL = 'email';
export const PROTOCOL_TWITTER = 'twitter';
export const PROTOCOL_MASTODON = 'mastodon';

export class Participant {
  constructor(props = {}) {
    Object.assign(this, props);
  }

  address: string;

  protocol: string;

  label?: string;

  type: 'To' | 'Cc' | 'Bcc' | 'From' | 'Reply-To' | 'Sender' = 'To';

  contact_ids?: Array<string> = [];
}
