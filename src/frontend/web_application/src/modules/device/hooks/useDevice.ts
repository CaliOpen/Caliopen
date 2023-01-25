import * as React from 'react';
import { useDispatch } from 'react-redux';
import { requestDevice } from '../actions/requestDevice';
import { getKeypair } from '../services/ecdsa';
import { getConfig, getPublicDevice, PublicDevice } from '../services/storage';

export const useDevice = () => {
  const dispatch = useDispatch();
  const [clientDevice, setClientDevice] = React.useState<PublicDevice>();

  React.useEffect(() => {
    const config = getConfig();
    if (!config) {
      return;
    }

    const { id, priv } = config;

    const keypair = getKeypair(priv);
    setClientDevice(getPublicDevice({ id, keypair }));
  }, []);

  return {
    requestDevice: () =>
      clientDevice
        ? dispatch(requestDevice({ deviceId: clientDevice.device_id }))
        : undefined,
    clientDevice,
  };
};
