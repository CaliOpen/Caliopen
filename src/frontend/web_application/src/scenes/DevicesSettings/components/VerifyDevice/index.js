import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { verifyDevice, removeDevice } from '../../../../store/modules/device';
import Presenter from './presenter';

const mapDispatchToProps = dispatch => bindActionCreators({
  onVerifyDevice: verifyDevice,
  onDeleteDevice: removeDevice,
}, dispatch);

export default compose(connect(null, mapDispatchToProps))(Presenter);
