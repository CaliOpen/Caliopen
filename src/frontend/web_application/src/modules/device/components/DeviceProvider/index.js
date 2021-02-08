import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import {
  setNewDevice,
  setDeviceGenerated,
} from '../../../../store/modules/device';
import Presenter from './presenter';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setNewDevice,
      setDeviceGenerated,
    },
    dispatch
  );

export default compose(connect(null, mapDispatchToProps))(Presenter);
