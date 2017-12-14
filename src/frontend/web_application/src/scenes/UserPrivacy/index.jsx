import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslator } from '@gandi/react-translate';
import { withUser } from '../../hoc/user';
import { requestUser } from '../../store/modules/user';
import Presenter from './presenter';

const userSelector = state => state.user;

const mapStateToProps = createSelector(
 [userSelector],
 userState => ({
   isFetching: userState.isFetching,
 })
);

const mapDispatchToProps = dispatch => bindActionCreators({
  requestUser,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withUser(),
  withTranslator()
)(Presenter);
