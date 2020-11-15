import * as React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import {
  getRecipients,
  getRecipientsExceptUser,
  isUserRecipient,
} from '../../../../services/message';

@withI18n()
class MessageRecipients extends PureComponent {
  static propTypes = {
    message: PropTypes.shape({}).isRequired,
    user: PropTypes.shape({}).isRequired,
    shorten: PropTypes.bool,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    shorten: false,
  };

  getRecipientsString = () => {
    const { shorten, i18n } = this.props;
    const recipients = this.getRecipientsArray();
    const numberRecipients = recipients.length;

    if (numberRecipients === 0) {
      return i18n._('message.participants.me', null, { defaults: 'Me' });
    }
    if (!shorten || numberRecipients === 1) return recipients.join(', ');

    return i18n._(
      'messages.participants.and_x_others',
      { first: recipients[0], number: numberRecipients - 1 },
      {
        defaults:
          '{first} and {number, plural, one {# other} other {# others}}',
      }
    );
  };

  getRecipientsLabels = (recipients) => {
    if (!recipients) return [];

    return recipients.map((recipient) =>
      recipient.label ? recipient.label : recipient.address
    );
  };

  const recipients =
    user && isUserRecipient(message, user)
      ? [
          i18n._('message.participants.me', null, { defaults: 'Me' }),
          ...getRecipientsLabels(getRecipientsExceptUser(message, user)),
        ]
      : getRecipientsLabels(getRecipients(message));

  const numberRecipients = recipients.length;

  if (numberRecipients === 0) {
    return i18n._('message.participants.me', null, { defaults: 'Me' });
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
