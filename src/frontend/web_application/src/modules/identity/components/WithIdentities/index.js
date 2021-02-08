import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import Presenter from './presenter';
import { getIdentities } from '../../actions/getIdentities';
import { identitiesSelector } from '../../selectors/identitiesSelector';

const remoteIdentitystateSelector = (state) => state.remoteIdentity;
const localIdentityStateSelector = (state) => state.localIdentity;

const mapStateToProps = createSelector(
  [remoteIdentitystateSelector, localIdentityStateSelector, identitiesSelector],
  ({ remoteIsFetching }, { localIsFetching }, identities) => ({
    identities,
    remoteIsFetching,
    localIsFetching,
  })
);
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getIdentities,
    },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
