const IDENTITY_PROTOCOLS = {
  email: 'email',
  smtp: 'email',
  imap: 'email',
  twitter: 'twitter',
  mastodon: 'mastodon',
};

export const getIdentityProtocol = (identity) =>
  IDENTITY_PROTOCOLS[identity.protocol];
