import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  notifySuccess,
  notifyInfo,
  notifyWarning,
  notifyError,
} from '../actions/notify';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      notifySuccess,
      notifyInfo,
      notifyWarning,
      notifyError,
    },
    dispatch
  );

export const withNotification = () => (Component) =>
  connect(null, mapDispatchToProps)(Component);
