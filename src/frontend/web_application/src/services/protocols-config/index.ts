import { Type } from 'src/components/Icon';
import { Protocol } from 'src/store/modules/participant-suggestions';

// XXX: unexpected lint error
// eslint-disable-next-line no-shadow
export enum ASSOC_PROTOCOL_ICON {
  email = 'envelope',
  mastodon = 'mastodon',
  twitter = 'twitter',
  unknown = 'question-circle',
}

export const getIconType = (protocol: Protocol): Type =>
  ASSOC_PROTOCOL_ICON[protocol] || ASSOC_PROTOCOL_ICON.unknown;

export default {
  unknown: {
    default: true,
  },
  sms: {},
  email: {
    regexp: /^[a-z0-9.!#$%&*+=?_{}~-]+@([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,60}$/,
  },
  twitter: {
    // https://help.twitter.com/en/managing-your-account/twitter-username-rules
    regexp: /^\w{1,15}$/,
  },
  facebook: {},
  mastodon: {
    regexp: /^[a-z0-9.!#$%&*+=?_{}~-]+@([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,60}$/,
  },
};
