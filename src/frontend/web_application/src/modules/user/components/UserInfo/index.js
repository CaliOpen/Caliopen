import { createSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { userSelector } from '../../selectors/userSelector';
import Presenter from './presenter';
import { requestLocalIdentities } from '../../../../store/modules/local-identity';

const mapStateToProps = createSelector([userSelector], (user) => ({
  user,
}));
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ requestLocalIdentities }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);
