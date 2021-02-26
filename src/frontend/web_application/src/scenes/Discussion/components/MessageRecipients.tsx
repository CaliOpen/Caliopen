import * as React from 'react';
import { withI18n } from '@lingui/react';
import { I18n } from '@lingui/core';
import { useUser } from 'src/modules/user';
import { Message } from 'src/modules/message';
import {
  getRecipients,
  getRecipientsExceptUser,
  isUserRecipient,
} from '../../../services/message';

interface Props {
  message: Message;
  shorten?: boolean;
  i18n: I18n;
}
function MessageRecipients({ message, shorten = false, i18n }: Props) {
  const { user } = useUser();

  const getRecipientsLabels = (recipients) => {
    if (!recipients) return [];

    return recipients.map((recipient) =>
      recipient.label ? recipient.label : recipient.address
    );
  };

  const recipients =
    user && isUserRecipient(message, user)
      ? [
          i18n._('message.participants.me', undefined, { defaults: 'Me' }),
          ...getRecipientsLabels(getRecipientsExceptUser(message, user)),
        ]
      : getRecipientsLabels(getRecipients(message));

  const numberRecipients = recipients.length;

  if (numberRecipients === 0) {
    return i18n._('message.participants.me', undefined, { defaults: 'Me' });
  }
  if (!shorten || numberRecipients === 1) return recipients.join(', ');

  const recipientsStr = i18n._(
    'messages.participants.and_x_others',
    { first: recipients[0], number: numberRecipients - 1 },
    {
      defaults: '{first} and {number, plural, one {# other} other {# others}}',
    }
  );

  return <span className="m-message-recipients">{recipientsStr}</span>;
}

export default withI18n()(MessageRecipients);
