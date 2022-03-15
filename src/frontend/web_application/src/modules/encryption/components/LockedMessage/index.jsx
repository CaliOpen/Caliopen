import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Icon } from '../../../../components';

import './style.scss';

class LockedMessage extends PureComponent {
  static propTypes = {
    encryptionStatus: PropTypes.shape({}),
  };

  static defaultProps = {
    encryptionStatus: undefined,
  };

  renderStatusText = () => {
    const { encryptionStatus } = this.props;

    if (!encryptionStatus) {
      return (
        <Trans id="encryption.locked-message.status.no-detail" message="…" />
      );
    }

    switch (encryptionStatus.status) {
      case 'need_passphrase':
        return (
          <Trans
            id="encryption.locked-message.status.need_passphrase"
            message="Enter your passphrase to unlock."
          />
        );
      case 'decrypting':
        return (
          <Trans
            id="encryption.locked-message.status.decrypting"
            message="Decryption in progress…"
          />
        );
      case 'need_privatekey':
        return (
          <Trans
            id="encryption.locked-message.status.need_privatekey"
            message="No available private key can decrypt this message."
          />
        );
      case 'error':
        return (
          <Fragment>
            <Trans
              id="encryption.locked-message.status.error"
              message="Error while trying to decrypt."
            />
            {` (${encryptionStatus.error})`}
          </Fragment>
        );
      default:
        return (
          <Trans id="encryption.locked-message.status.no-detail" message="…" />
        );
    }
  };

  render() {
    return (
      <div className="m-encryption-locked-message">
        <div className="m-encryption-locked-message__message">
          <Icon type="lock" className="m-encryption-locked-message__icon" />
          <Trans
            id="encryption.locked-message.primary-text"
            message="Le contenu de ce message est chiffré."
          />
          <br />
          <span className="m-encryption-locked-message__status m-encryption-locked-message__status--error">
            {this.renderStatusText()}
          </span>
        </div>
      </div>
    );
  }
}

export default LockedMessage;
