import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Trans } from '@lingui/react';
import { Device } from 'src/modules/device/types';
import { Button, Spinner } from 'src/components';
import { notifySuccess } from 'src/modules/userNotify';
import { verifyDevice } from 'src/modules/device';

interface Props {
  device: Device;
}

function VerifyDevice({ device }: Props) {
  const dispatch = useDispatch();
  const [sending, setSending] = React.useState(false);

  const handleVerify = async () => {
    setSending(true);
    try {
      await dispatch(verifyDevice({ device }));
      dispatch(
        notifySuccess({
          message: (
            <Trans
              id="device.feedback.send-validation-success"
              message="An email has been sent to your backup email in order to verify the device."
            />
          ),
        })
      );
    } catch (e) {
      // continue to the next handler
      throw new Error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      icon={
        sending ? (
          <Spinner
            svgTitleId="verify-device-spinner"
            isLoading
            display="inline"
          />
        ) : (
          'check'
        )
      }
      shape="plain"
      className="m-device-verify__button"
      onClick={handleVerify}
      disabled={sending}
    >
      <Trans id="device.action.verify" message="Verify this device" />
    </Button>
  );
}

export default VerifyDevice;
