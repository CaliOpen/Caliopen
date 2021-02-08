import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Trans } from '@lingui/react';
import { Section } from '../../../../components';
import { STATUS_VERIFIED } from '../../../../modules/device';
import DeviceForm from '../DeviceForm';
import DeviceInformation from '../DeviceInformation';
import VerifyDevice from '../VerifyDevice';
import RevokeDevice from '../RevokeDevice';

class DeviceSettings extends Component {
  static propTypes = {
    isLastVerifiedDevice: PropTypes.bool,
    isCurrentDevice: PropTypes.bool,
    isCurrentDeviceVerified: PropTypes.bool,
    device: PropTypes.shape({}),
  };

  static defaultProps = {
    isLastVerifiedDevice: undefined,
    isCurrentDevice: undefined,
    isCurrentDeviceVerified: undefined,
    device: null,
  };

  renderVerifyDevice() {
    const { device } = this.props;

    if (device.status === STATUS_VERIFIED) {
      return null;
    }

    return <VerifyDevice device={device} />;
  }

  renderRevokeDevice() {
    const { device, isCurrentDeviceVerified, isCurrentDevice } = this.props;

    if (isCurrentDeviceVerified || isCurrentDevice) {
      return <RevokeDevice device={device} />;
    }

    return null;
  }

  render() {
    const { device, isCurrentDevice } = this.props;
    const borderContext =
      device.status === STATUS_VERIFIED ? 'safe' : 'disabled';

    return (
      <Section borderContext={borderContext}>
        <DeviceInformation device={device} isCurrentDevice={isCurrentDevice} />
        <DeviceForm device={device} />
        <div>
          {this.renderVerifyDevice()} {this.renderRevokeDevice()}
        </div>
      </Section>
    );
  }
}

export default DeviceSettings;
