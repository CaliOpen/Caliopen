import { compose } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { withDevices, withDevice, STATUS_VERIFIED } from '../../modules/device';
import Presenter from './presenter';
import DeviceSettings from './components/DeviceSettings';

export { DeviceSettings };

const devicesSelector = (state) => state.device.devicesById;

const clientDeviceSelector = (state, { clientDevice }) => clientDevice;
const currentDeviceSelector = createSelector(
  [clientDeviceSelector, devicesSelector],
  (clientDevice, devicesById) =>
    clientDevice && devicesById[clientDevice.device_id]
);

const mapStateToProps = createSelector(
  [currentDeviceSelector],
  (currentDevice) => ({
    isCurrentDeviceVerified:
      currentDevice && currentDevice.status === STATUS_VERIFIED,
  })
);

export default compose(
  withDevices(),
  withDevice(),
  connect(mapStateToProps)
)(Presenter);
