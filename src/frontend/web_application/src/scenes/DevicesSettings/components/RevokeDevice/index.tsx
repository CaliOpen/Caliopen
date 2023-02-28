import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Trans } from '@lingui/react';
import { Button, Icon } from 'src/components';
import { signout } from 'src/modules/routing';
import { revokeDevice, getClientDevice } from 'src/modules/device';
import { notifyError, notifySuccess } from 'src/modules/userNotify';
import { Device } from 'src/modules/device/types';
// unused for now: we want inline buttons
// import './style.scss';

interface Props {
  device: Device;
}
function RevokeDevice({ device }: Props) {
  const dispatch = useDispatch();
  const clientDevice = getClientDevice();

  const handleRevoke = async () => {
    try {
      await dispatch(revokeDevice({ device }));
      dispatch(
        notifySuccess({
          message: (
            <Trans
              id="device.feedback.revoke_success"
              message="The device has been revoked"
            />
          ),
        })
      );
      if (device.device_id === clientDevice?.device_id) {
        signout();
      }
    } catch ({ message }) {
      dispatch(notifyError({ message }));
    }
  };

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
        onClick={handleRevoke}
      >
        <Icon type="remove" rightSpaced />
        <Trans id="device.action.revoke" message="Revoke this device" />
      </Button>
    </span>
  );
}

export default RevokeDevice;
