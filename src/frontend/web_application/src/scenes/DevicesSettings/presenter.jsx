import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
import { PageTitle, Section } from '../../components';
import DeviceSettings from './components/DeviceSettings';
import './style.scss';

class DevicesSettings extends PureComponent {
  static propTypes = {
    isCurrentDeviceVerified: PropTypes.bool,
    devicesProps: PropTypes.shape({
      devices: PropTypes.arrayOf(PropTypes.shape({})),
      requestDevices: PropTypes.func.isRequired,
      isFetching: PropTypes.bool,
      didInvalidate: PropTypes.bool,
    }).isRequired,
  };

  static defaultProps = {
    isCurrentDeviceVerified: undefined,
  };

  componentDidMount() {
    const { requestDevices } = this.props.devicesProps;

    requestDevices();
  }

  componentDidUpdate() {
    const {
      requestDevices,
      didInvalidate,
      isFetching,
    } = this.props.devicesProps;

    if (didInvalidate && !isFetching) {
      requestDevices();
    }
  }

  render() {
    const {
      devicesProps: { devices },
      isCurrentDeviceVerified,
    } = this.props;

    return (
      <div className="s-devices-settings">
        <PageTitle />
        {isCurrentDeviceVerified === false && (
          <div className="s-devices-settings__info">
            <Section>
              <div>
                <Trans id="devices.feedback.unverified_device">
                  It&apos;s the first time you attempt to connect to your
                  Caliopen account on this device.
                </Trans>
              </div>
              <div>
                <Trans
                  id="devices.feedback.unverified_device_more"
                  defaults={`
                  To respect privacy and security rules, your discussions
                  history will not fully appear according to Privacy settings
                  <0/>
                  Please verify this device and eventually set restrictions from
                  your trusted device.
                `}
                  components={[<br />]}
                />
              </div>
            </Section>
          </div>
        )}
        {devices &&
          devices.map((device) => (
            <div key={device.device_id} className="s-devices-settings__device">
              <DeviceSettings device={device} />
            </div>
          ))}
      </div>
    );
  }
}

export default DevicesSettings;
