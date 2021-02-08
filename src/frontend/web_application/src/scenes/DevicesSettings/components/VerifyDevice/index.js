import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { verifyDevice } from '../../../../modules/device';
import Presenter from './presenter';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onVerifyDevice: verifyDevice,
    },
    dispatch
  );

export default compose(connect(null, mapDispatchToProps))(Presenter);
