import { requestDevice as requestDeviceBase } from '../../../store/modules/device';

export const requestDevice = ({ deviceId }) => (dispatch) =>
  dispatch(requestDeviceBase({ deviceId })).then(
    (response) => response.payload.data
  );
