import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'lingui-react';
import Button from '../../../../components/Button';

class VerifyDevice extends Component {
  static propTypes = {
    device: PropTypes.shape({}).isRequired,
    onDeleteDevice: PropTypes.func.isRequired,
    onVerifyDevice: PropTypes.func.isRequired,
  };

  handleVerify = () => {
    const { device, onVerifyDevice } = this.props;
    onVerifyDevice({ device });
  };

  handleDelete = () => {
    const { device, onDeleteDevice } = this.props;
    onDeleteDevice({ device });
  };

  render() {
    return (
      <div className="m-device-verify">
        <Button
          shape="plain"
          className="m-device-verify__button"
          onClick={this.handleVerify}
        >
          <Trans id="device.action.verify">Verify this device</Trans>
        </Button>
        <br />
        <Trans id="device.verify.not-you">It&apos;s not you?</Trans>
        {' '}
        <Button onClick={this.handleDelete}><Trans id="device.action.delete">Delete</Trans></Button>
      </div>
    );
  }
}

export default VerifyDevice;
