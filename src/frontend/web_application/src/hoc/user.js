// @deprecated: use modules/user
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { UserSelector } from '../store/selectors/user';

const mapStateToProps = createSelector([UserSelector], (userState) => ({
  user: userState.user,
}));

const withUser = () => (Component) => connect(mapStateToProps)(Component);

export { withUser };
