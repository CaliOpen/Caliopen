import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  updateAll,
  setInitialized,
} from '../../../../store/modules/notification';
import Presenter from './presenter';

const mapStateToProps = (state) => ({
  notifications: state.notification.notifications,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNotifications: updateAll,
      setInitialized,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);
