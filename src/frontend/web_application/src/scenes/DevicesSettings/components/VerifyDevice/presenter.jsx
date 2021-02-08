import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { Button, Spinner } from '../../../../components';
import { withNotification } from '../../../../modules/userNotify';

@withNotification()
class VerifyDevice extends Component {
  static propTypes = {
    device: PropTypes.shape({}).isRequired,
    onVerifyDevice: PropTypes.func.isRequired,
    notifySuccess: PropTypes.func.isRequired,
  };

  state = {
    sending: false,
  };

  handleVerify = async () => {
    const { device, onVerifyDevice, notifySuccess } = this.props;
    this.setState({ sending: true });
    try {
      await onVerifyDevice({ device });
      notifySuccess({
        message: (
          <Trans id="device.feedback.send-validation-success">
            An email has been sent to your backup email in order to verify the
            device.
          </Trans>
        ),
      });
    } catch (e) {
      // continue to the next handler
      throw new Error(e);
    } finally {
      this.setState({ sending: false });
    }
  };

  render() {
    return (
      <Button
        icon={
          this.state.sending ? <Spinner isLoading display="inline" /> : 'check'
        }
        shape="plain"
        className="m-device-verify__button"
        onClick={this.handleVerify}
        disabled={this.state.sending}
      >
        <Trans id="device.action.verify">Verify this device</Trans>
      </Button>
    );
  }
}

export default VerifyDevice;
