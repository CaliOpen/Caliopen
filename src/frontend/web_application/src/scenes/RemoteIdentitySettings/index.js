import { createSelector } from 'reselect';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withI18n } from '@lingui/react';
import {
  createIdentity,
  deleteIdentity,
  updateIdentity,
  identitiesSelector,
  identityStateSelector,
} from '../../modules/remoteIdentity';
import { requestRemoteIdentities } from '../../store/modules/remote-identity';
import { requestProviders } from '../../store/modules/provider';
import { getModuleStateSelector } from '../../store/selectors/getModuleStateSelector';
import { withNotification } from '../../modules/userNotify';
import Presenter from './presenter';

const providersSelector = (state) => {
  const { providers } = getModuleStateSelector('provider')(state);

  return providers && providers.map((provider) => provider.name);
};

const mapStateToProps = createSelector(
  [identityStateSelector, identitiesSelector, providersSelector],
  (identityState, identities, providers) => ({
    isFetching: identityState.isFetching,
    identities: [...identities].sort((a, b) =>
      a.display_name.localeCompare(b.display_name)
    ),
    providers,
  })
);

const onIdentityChange = ({ identity }) => (dispatch) => {
  if (!identity.identity_id) {
    return dispatch(createIdentity({ identity }));
  }

  return dispatch(updateIdentity({ identity }));
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      requestRemoteIdentities,
      onIdentityChange,
      onIdentityDelete: deleteIdentity,
      requestProviders,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withI18n(),
  withNotification()
)(Presenter);
