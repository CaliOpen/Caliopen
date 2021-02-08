import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import Presenter from './presenter';
import { getUser } from '../../actions/getUser';
import { userSelector } from '../../selectors/userSelector';

const mapStateToProps = createSelector([userSelector], (user) => ({ user }));

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ getUser }, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
