import { createSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withDevice, STATUS_VERIFIED } from '../../../../modules/device';
import Presenter from './presenter';

const devicesSelector = (state) => state.device.devicesById;
const deviceSelector = (state, ownProps) => ownProps.device;

const clientDeviceSelector = (state, { clientDevice }) => clientDevice;
const currentDeviceSelector = createSelector(
  [clientDeviceSelector, devicesSelector],
  (clientDevice, devicesById) =>
    clientDevice && devicesById[clientDevice.device_id]
);

const mapStateToProps = createSelector(
  [devicesSelector, deviceSelector, currentDeviceSelector],
  (devicesById, device, currentDevice) => ({
    device,
    isLastVerifiedDevice:
      device &&
      device.status === STATUS_VERIFIED &&
      Object.keys(devicesById).filter(
        (id) => devicesById[id].status === STATUS_VERIFIED
      ).length <= 1,
    isCurrentDevice: currentDevice && currentDevice === device,
    isCurrentDeviceVerified:
      currentDevice && currentDevice.status === STATUS_VERIFIED,
  })
);

export default compose(withDevice(), connect(mapStateToProps))(Presenter);
