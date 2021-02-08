import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { revokeDevice, withDevice } from '../../../../modules/device';
import { withNotification } from '../../../../modules/userNotify';
import Presenter from './presenter';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      revokeDevice,
    },
    dispatch
  );

export default compose(
  withDevice(),
  connect(null, mapDispatchToProps),
  withNotification()
)(Presenter);
