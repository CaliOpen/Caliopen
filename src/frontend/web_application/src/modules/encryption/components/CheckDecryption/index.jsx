import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
// import { Trans } from '@lingui/react';
import AskPassphraseForm from '../AskPassphraseForm';
import { messageEncryptionStatusesSelector } from '../../selectors/message';

import './style.scss';

const lockedMessagesSelector = (messagesIds) =>
  createSelector([messageEncryptionStatusesSelector], (encryptionState) => ({
    lockedMessagesByKey: messagesIds.reduce((acc, messageId) => {
      const messageStatus = encryptionState[messageId];

      if (messageStatus && messageStatus.status === 'need_passphrase') {
        return {
          ...acc,
          [messageStatus.keyFingerprint]:
            (acc[messageStatus.keyFingerprint] || 0) + 1,
        };
      }

      return acc;
    }, {}),
    keyLessMessages: messagesIds.reduce(
      (acc, messageId) =>
        encryptionState[messageId] &&
        encryptionState[messageId].status === 'need_privatekey'
          ? acc + 1
          : acc,
      0
    ),
  }));

const mapStateToProps = (state, ownProps) =>
  lockedMessagesSelector(
    ownProps.messages.map((message) => message.message_id)
  );

@connect(mapStateToProps)
class CheckDecryption extends Component {
  static propTypes = {
    // message is mandatory for mapStateToProps calculation.
    // eslint-disable-next-line react/no-unused-prop-types
    messages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    lockedMessagesByKey: PropTypes.shape({}).isRequired,
    keyLessMessages: PropTypes.number.isRequired,
  };

  render() {
    const { lockedMessagesByKey } = this.props;

    return (
      <section className="m-check-decryption">
        {Object.entries(lockedMessagesByKey).map(
          ([fingerprint, numberMessages]) => (
            <AskPassphraseForm
              fingerprint={fingerprint}
              numberMessages={numberMessages}
              key={fingerprint}
              className="m-check-decryption-panel"
            />
          )
        )}
        {
          // TODO re-enable when dismiss ok.
          /* (keyLessMessages > 0) && (
          <div className="m-check-decryption__missing-key m-check-decryption-panel">
            <Trans id="encryption.messages.missing-key" values={{ keyLessMessages }}>
              {`${keyLessMessages}`} messages cannot be decrypted with available secret keys.
            </Trans>
          </div>
        ) */
        }
      </section>
    );
  }
}

export default CheckDecryption;
