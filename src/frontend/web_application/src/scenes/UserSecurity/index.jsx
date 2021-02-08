import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import { withNotification } from '../../modules/userNotify';
import { withUser } from '../../hoc/user';
import { requestUser } from '../../store/modules/user';
import Presenter from './presenter';

const userSelector = (state) => state.user;

const mapStateToProps = createSelector([userSelector], (userState) => ({
  isFetching: userState.isFetching,
}));

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestUser,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withI18n(),
  withUser(),
  withNotification()
)(Presenter);
