import { connect } from 'react-redux';
import { createNotification, NOTIFICATION_TYPE_INFO } from 'react-redux-notify';
import Presenter from './presenter';

const notification = {
  message: 'Compose to contact is not yet implemented.',
  type: NOTIFICATION_TYPE_INFO,
  duration: 10000,
  canDismiss: true,
};

const mapDispatchToProps = dispatch => ({
  action: () => {
    dispatch(createNotification(notification));
  },
});

export default connect(null, mapDispatchToProps)(Presenter);
