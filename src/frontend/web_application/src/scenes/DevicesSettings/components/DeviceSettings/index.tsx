import * as React from 'react';
import { Device } from 'src/modules/device/types';
import { selectDevice } from 'src/modules/device/selectors';
import { useSelector } from 'src/store/reducer';
import { getClientDevice, STATUS_VERIFIED } from 'src/modules/device';
import { Section } from '../../../../components';
import DeviceForm from '../DeviceForm';
import DeviceInformation from '../DeviceInformation';
import VerifyDevice from '../VerifyDevice';
import RevokeDevice from '../RevokeDevice';

interface Props {
  device: Device;
}

export default function DeviceSettings({ device }: Props) {
  const clientDevice = getClientDevice();
  const currentDevice = useSelector((state) =>
    clientDevice ? selectDevice(state, clientDevice.device_id) : undefined
  );

  const isCurrentDevice = currentDevice === device;
  const isCurrentDeviceVerified = currentDevice?.status === STATUS_VERIFIED;

  const renderVerifyDevice = () => {
    if (device.status === STATUS_VERIFIED) {
      return null;
    }

    return <VerifyDevice device={device} />;
  };

  const renderRevokeDevice = () => {
    if (isCurrentDeviceVerified || isCurrentDevice) {
      return <RevokeDevice device={device} />;
    }

    return null;
  };

  const borderContext = device.status === STATUS_VERIFIED ? 'safe' : 'disabled';

  return (
    <Section borderContext={borderContext}>
      <DeviceInformation device={device} isCurrentDevice={isCurrentDevice} />
      <DeviceForm device={device} />
      <div>
        {renderVerifyDevice()} {renderRevokeDevice()}
      </div>
    </Section>
  );
}
