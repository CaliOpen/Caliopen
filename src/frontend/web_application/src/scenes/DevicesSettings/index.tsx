import * as React from 'react';
import { Trans } from '@lingui/react';
import { useDevices } from 'src/modules/device/hooks/useDevices';
import { getClientDevice, STATUS_VERIFIED } from 'src/modules/device';
import { useDevice } from 'src/modules/device/hooks/useDevice';
import { PageTitle, Section } from 'src/components';
import DeviceSettings from './components/DeviceSettings';
import './style.scss';

export default function DevicesSettings() {
  const { devices } = useDevices();
  const clientDevice = getClientDevice();
  const { device } = useDevice(clientDevice.device_id);
  // we consider the device as verified until devices have been loaded
  const isCurrentDeviceVerified =
    !devices || device?.status === STATUS_VERIFIED;

  return (
    <div className="s-devices-settings">
      <PageTitle />
      {!isCurrentDeviceVerified && (
        <div className="s-devices-settings__info">
          <Section>
            <div>
              <Trans
                id="devices.feedback.unverified_device"
                message="It's the first time you attempt to connect to your Caliopen account on this device."
              />
            </div>
            <div>
              <Trans
                id="devices.feedback.unverified_device_more"
                message={`
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
      {devices?.map((item) => (
        <div key={item.device_id} className="s-devices-settings__device">
          <DeviceSettings device={item} />
        </div>
      ))}
    </div>
  );
}
