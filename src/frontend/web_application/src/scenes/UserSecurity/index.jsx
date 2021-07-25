import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import { withUser } from 'src/modules/user';
import { requestUser } from 'src/modules/user/store/reducer';
import { withNotification } from '../../modules/userNotify';
import Presenter from './presenter';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestUser,
    },
    dispatch
  );

export default compose(
  connect(undefined, mapDispatchToProps),
  withI18n(),
  withUser(),
  withNotification()
)(Presenter);
