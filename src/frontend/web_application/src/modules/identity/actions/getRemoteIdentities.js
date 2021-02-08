import { requestRemoteIdentities } from '../../../store/modules/remote-identity';

export const getRemoteIdentities = () => async (dispatch, getState) => {
  let remoteIdentityState = getState().remoteIdentity;
  const { remoteIdentities, didInvalidate } = remoteIdentityState;

  if (remoteIdentities.length > 0 && !didInvalidate) {
    return remoteIdentities.map(
      (identityId) => remoteIdentityState.remoteIdentitiesById[identityId]
    );
  }

  await dispatch(requestRemoteIdentities());

  remoteIdentityState = getState().remoteIdentity;

  return remoteIdentities.map(
    (identityId) => remoteIdentityState.remoteIdentitiesById[identityId]
  );
};
