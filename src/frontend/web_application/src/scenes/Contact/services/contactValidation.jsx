import React from 'react';
import { Trans } from '@lingui/react';
import {
  IDENTITY_TYPE_TWITTER,
  IDENTITY_TYPE_MASTODON,
} from '../../../modules/contact';
import protocolsConfig from '../../../services/protocols-config';

const twitterHandleRegExpr = protocolsConfig.twitter.regexp;
const mastodonHandleRegExpr = protocolsConfig.mastodon.regexp;

export const contactValidation = (values) => {
  const errors = {};

  const identityErrors = !values.identities
    ? []
    : values.identities.map((identity) => {
        const identityError = {};
        let hasError = false;
        if (!identity.type) {
          identityError.type = 'type missing';
          hasError = true;
        }

        if (
          identity.type === IDENTITY_TYPE_TWITTER &&
          !twitterHandleRegExpr.test(identity.name)
        ) {
          identityError.name = (
            <Trans
              id="contact.form.identity.not_twitter"
              values={{ name: identity.name }}
              defaults="The twitter username {name} is invalid. It should be between 1 or 15 characters with no special characters. For example «caliopen_org»."
            />
          );
          hasError = true;
        }

        if (
          identity.type === IDENTITY_TYPE_MASTODON &&
          !mastodonHandleRegExpr.test(identity.name)
        ) {
          identityError.name = (
            <Trans
              id="contact.form.identity.not_mastodon"
              values={{ name: identity.name }}
              defaults="The mastodon username {name} is invalid. It should be in the format of an email. For example «my_friend@mastodon.instance»."
            />
          );
          hasError = true;
        }

        return hasError ? identityError : undefined;
      }, []);

  if (identityErrors && identityErrors.length) {
    errors.identities = identityErrors;
  }

  return errors;
};
