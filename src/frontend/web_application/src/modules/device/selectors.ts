import { createSelector } from 'reselect';
import { RootState } from 'src/store/reducer';
import { Device } from './types';

export const selectDevice = (
  state: RootState,
  deviceId: string
): void | Device => state.device.devicesById[deviceId];

export const selectDeviceState = (state: RootState) => state.device;
export const selectDevices = createSelector(selectDeviceState, (deviceState) =>
  deviceState.devices.map((id) => deviceState.devicesById[id])
);

export const selectIsFetching = (state: RootState) =>
  selectDeviceState(state).isFetching;

export const selectDidInvalidate = (state: RootState) =>
  selectDeviceState(state).didInvalidate;
