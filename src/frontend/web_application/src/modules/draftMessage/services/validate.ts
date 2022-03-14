import { I18n } from '@lingui/core';
import { IDraftMessageFormData } from '../types';
import { getIdentityProtocol } from './getIdentityProtocol';
import { PROTOCOL_MASTODON, PROTOCOL_TWITTER } from '../../message';

export const validate = ({
  draftMessage,
  i18n,
  availableIdentities,
  options = {
    ignoreBody: false,
  },
}: {
  draftMessage: IDraftMessageFormData;
  i18n: I18n;
  availableIdentities: any[];
  options?: { ignoreBody: boolean };
}): string[] => {
  const identity = availableIdentities.find(
    (ident) => ident.identity_id === draftMessage.identity_id
  );

  if (!identity) {
    return [
      i18n._(/* i18n */ 'draft-message.errors.missing-identity', undefined, {
        message: 'An identity is mandatory to create a draft',
      }),
    ];
  }

  const errors: string[] = [];
  const protocol = getIdentityProtocol(identity);

  if (
    draftMessage.recipients.some(
      (participant) => participant.protocol !== protocol
    )
  ) {
    errors.push(
      i18n._(
        /* i18n */ 'draft-message.errors.invalid-participant',
        { protocol },
        {
          message:
            'According to your identity, all your participants must use a {protocol} address to contact them all together',
        }
      )
    );
  }

  if (
    !options.ignoreBody &&
    (protocol === PROTOCOL_TWITTER || protocol === PROTOCOL_MASTODON) &&
    draftMessage.body.length === 0
  ) {
    errors.push(
      i18n._(
        /* i18n */ 'draft-message.errors.empty-body',
        { protocol },
        { message: 'The body cannot be empty for a {protocol} message.' }
      )
    );
  }

  return errors;
};
