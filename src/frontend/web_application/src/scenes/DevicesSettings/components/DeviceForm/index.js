import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import { saveDevice } from '../../../../modules/device';
import { withNotification } from '../../../../modules/userNotify';
import Presenter from './presenter';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onChange: saveDevice,
    },
    dispatch
  );

export default compose(
  connect(null, mapDispatchToProps),
  withI18n(),
  withNotification()
)(Presenter);
