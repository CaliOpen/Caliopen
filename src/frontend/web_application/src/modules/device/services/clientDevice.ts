import { ClientDevice, getConfig, initConfig } from './storage';
import { Config } from '../types';

const initClientDevice = () => {
  let config = getConfig();

  if (!config) {
    initConfig();
    config = getConfig() as Config;
  }
  return new ClientDevice(config);
};

let clientDevice: ClientDevice;

/**
 * client device singleton. Can only be used in browser.
 */
export const getClientDevice = () => {
  if (BUILD_TARGET !== 'browser') {
    throw new Error('`getClientDevice` must be used in a browser');
  }

  if (!clientDevice) {
    clientDevice = initClientDevice();
  }

  return clientDevice;
};
