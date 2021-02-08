import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import Moment from 'react-moment';
import { Trans } from '@lingui/react';
import { Icon, TextBlock } from '../../../../components';
import './style.scss';

class DeviceInformation extends PureComponent {
  static propTypes = {
    device: PropTypes.shape({}).isRequired,
    // locale: PropTypes.string,
    isCurrentDevice: PropTypes.bool,
  };

  static defaultProps = {
    // locale: undefined,
    isCurrentDevice: false,
  };

  render() {
    const { device, isCurrentDevice } = this.props;
    const deviceType =
      device.type && device.type !== 'other' ? device.type : 'question-circle';

    return (
      <div className="m-device-information">
        <div className="m-device-information__icon">
          <Icon type={deviceType} />
        </div>
        <div className="m-device-information__device">
          <div className="m-device-information__info">
            {isCurrentDevice && (
              <TextBlock className="m-device-information__current-device">
                (<Trans id="device.current_device">Current device</Trans>)
              </TextBlock>
            )}
            <TextBlock className="m-device-information__name">
              {device.name}
            </TextBlock>
            {/* TODO: display connected status for device
            <span className="m-device-information__status">
              device.isConnected && (
                <Trans id="device.status.connected">Connected</Trans>
                {' '}
                <Icon type="check" className="m-device-information__status-icon" />
              )
            </span>
          */}
          </div>
          <span className="m-device-information__user-agent">
            {device.user_agent}
          </span>
          {/* date insert: <Moment format="LLL" locale={locale}>{device.date_insert}</Moment><br />
          date created: <Moment format="LLL" locale={locale}>{device.last_seen}</Moment> */}
        </div>
      </div>
    );
  }
}

export default DeviceInformation;
