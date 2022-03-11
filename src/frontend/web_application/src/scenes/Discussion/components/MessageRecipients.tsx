import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { useUser } from 'src/modules/user';
import { Message } from 'src/modules/message';
import {
  getRecipients,
  getRecipientsExceptUser,
  isUserRecipient,
} from '../../../services/message';

interface Props extends withI18nProps {
  message: Message;
  shorten?: boolean;
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
          i18n._(/* i18n */ 'message.participants.me', undefined, {
            message: 'Me',
          }),
          ...getRecipientsLabels(getRecipientsExceptUser(message, user)),
        ]
      : getRecipientsLabels(getRecipients(message));

  const numberRecipients = recipients.length;

  if (numberRecipients === 0) {
    return i18n._(/* i18n */ 'message.participants.me', undefined, {
      message: 'Me',
    });
  }
  if (!shorten || numberRecipients === 1) return recipients.join(', ');

  const recipientsStr = i18n._(
    /* i18n */ 'messages.participants.and_x_others',
    { first: recipients[0], number: numberRecipients - 1 },
    {
      message: '{first} and {number, plural, one {# other} other {# others}}',
    }
  );

  return <span className="m-message-recipients">{recipientsStr}</span>;
}

export default withI18n()(MessageRecipients);
