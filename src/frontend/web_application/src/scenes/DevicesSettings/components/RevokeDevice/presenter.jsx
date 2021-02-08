import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Button, Icon } from '../../../../components';
import { signout } from '../../../../modules/routing';
// unused for now: we want inline buttons
// import './style.scss';

class RevokeDevice extends Component {
  static propTypes = {
    device: PropTypes.shape({}).isRequired,
    revokeDevice: PropTypes.func.isRequired,
    clientDevice: PropTypes.shape({}),
    notifyError: PropTypes.func.isRequired,
    notifySuccess: PropTypes.func.isRequired,
  };

  static defaultProps = {
    clientDevice: undefined,
  };

  handleRevoke = async () => {
    const {
      device,
      revokeDevice,
      notifySuccess,
      notifyError,
      clientDevice,
    } = this.props;

    try {
      await revokeDevice({ device });
      notifySuccess({
        message: (
          <Trans id="device.feedback.revoke_success">
            The device has been revoked
          </Trans>
        ),
      });
      if (device.device_id === clientDevice.device_id) {
        signout();
      }
    } catch ({ message }) {
      notifyError({ message });
    }
  };

  render() {
    return (
      <span className="m-device-revoke">
        {/* TODO: At this time we can't prevent any device to connect */}
        {/* <span className="m-device-revoke__info">
          <Trans id="device.revoke_info">You can prevent this device to connect to your account in
          the future.</Trans>
        </span> */}
        <Button
          className="m-device-revoke__button"
          shape="plain"
          color="alert"
          onClick={this.handleRevoke}
        >
          <Icon type="remove" rightSpaced />
          <Trans id="device.action.revoke">Revoke this device</Trans>
        </Button>
      </span>
    );
  }
}

export default RevokeDevice;
