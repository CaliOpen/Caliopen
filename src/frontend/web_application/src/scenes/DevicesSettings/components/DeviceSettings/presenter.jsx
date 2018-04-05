import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Trans } from 'lingui-react';
import { Spinner, Section } from '../../../../components';
import DeviceForm from '../DeviceForm';
import DeviceInformation from '../DeviceInformation';
import VerifyDevice from '../VerifyDevice';
import RevokeDevice from '../RevokeDevice';
import './style.scss';

class DeviceSettings extends Component {
  static propTypes = {
    isLastVerifiedDevice: PropTypes.bool,
    isCurrentDevice: PropTypes.bool,
    isCurrentDeviceVerified: PropTypes.bool,
    device: PropTypes.shape({}),
    isFetching: PropTypes.bool,
    i18n: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    isLastVerifiedDevice: undefined,
    isCurrentDevice: undefined,
    isCurrentDeviceVerified: undefined,
    device: null,
    isFetching: false,
  };

  renderRevokeButton() {
    const {
      device, isCurrentDevice, isLastVerifiedDevice, isCurrentDeviceVerified,
    } = this.props;

    if (isLastVerifiedDevice === undefined) {
      return null;
    }

    if (isLastVerifiedDevice) {
      return (<Trans id="device.info.last_verified_device">The last verified device can not be revoked.</Trans>);
    }

    if (isCurrentDeviceVerified || isCurrentDevice) {
      return (<RevokeDevice device={device} />);
    }

    return (<Trans id="device.info.other_device">You need a verified device to revoke this one.</Trans>);
  }

  renderForm() {
    const { device, isCurrentDevice } = this.props;

    return (
      <Section>
        <DeviceInformation device={device} isCurrentDevice={isCurrentDevice} />
        <DeviceForm device={device} />
        {this.renderRevokeButton()}
      </Section>
    );
  }

  renderVerifyDevice() {
    const { device, isCurrentDevice } = this.props;

    return (
      <Section>
        <DeviceInformation device={device} isCurrentDevice={isCurrentDevice} />
        <VerifyDevice device={device} />
      </Section>
    );
  }

  renderDevice() {
    const { device, i18n } = this.props;

    // FIXME: verify device should be displayed on a verified device or ...
    return device.signature_key === null ?
      this.renderVerifyDevice(device, i18n) :
      this.renderForm(device, i18n);
  }

  render() {
    const { device, isFetching } = this.props;
    const deviceClassName = classnames(
      'm-device-settings',
      {
        // TODO: set className according to security level
        // 'm-device-settings--safe': safe,
        // 'm-device-settings--public': public,
        // 'm-device-settings--insecure': insecure,
      },
    );

    return (
      <div className={deviceClassName}>
        {isFetching && <Spinner isLoading />}
        {device && this.renderDevice()}
      </div>
    );
  }
}

export default DeviceSettings;
