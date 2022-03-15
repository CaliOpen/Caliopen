import { verifyDevice as verifyDeviceBase } from '../../../store/modules/device';
import { requestDevice } from './requestDevice';

export const verifyDevice =
  ({ device }) =>
  async (dispatch) => {
    await dispatch(verifyDeviceBase({ device }));

    return dispatch(requestDevice({ deviceId: device.device_id }));
  };
