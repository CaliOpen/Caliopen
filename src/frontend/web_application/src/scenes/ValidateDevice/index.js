import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { requestDeviceVerification } from '../../store/modules/device';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestDeviceVerification,
    },
    dispatch
  );

export default compose(connect(null, mapDispatchToProps))(Presenter);
