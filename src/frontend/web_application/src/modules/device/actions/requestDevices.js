import { requestDevices as requestDevicesBase } from '../../../store/modules/device';

export const requestDevices = () => (dispatch) =>
  dispatch(requestDevicesBase()).then((response) => response.payload.data);
