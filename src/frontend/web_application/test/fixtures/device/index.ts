import { STATUS_UNVERIFIED } from 'src/modules/device';
import { Device } from 'src/modules/device/types';

export function generateDevice(): Device {
  return {
    device_id: 'aunrsite',
    name: 'My Device',
    status: STATUS_UNVERIFIED,
    type: 'other',
    user_agent: 'whatever',
  };
}
