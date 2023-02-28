import * as React from 'react';
// import Moment from 'react-moment';
import { Trans } from '@lingui/react';
import { Device } from 'src/modules/device/types';
import { Icon, TextBlock } from 'src/components';
import './style.scss';

interface Props {
  device: Device;
  isCurrentDevice: boolean;
}
function DeviceInformation({ device, isCurrentDevice }: Props) {
  const deviceType = device.type === 'other' ? 'question-circle' : device.type;

  return (
    <div className="m-device-information">
      <div className="m-device-information__icon">
        <Icon type={deviceType} />
      </div>
      <div className="m-device-information__device">
        <div className="m-device-information__info">
          {isCurrentDevice && (
            <TextBlock className="m-device-information__current-device">
              (<Trans id="device.current_device" message="Current device" />)
            </TextBlock>
          )}
          <TextBlock className="m-device-information__name">
            {device.name}
          </TextBlock>
          {/* TODO: display connected status for device
            <span className="m-device-information__status">
              device.isConnected && (
                <Trans id="device.status.connected" message="Connected" />
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

export default DeviceInformation;
