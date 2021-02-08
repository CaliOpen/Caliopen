import { createSelector } from 'reselect';
import { identityStateSelector } from './identityStateSelector';

export const identitiesSelector = createSelector(
  [identityStateSelector],
  (remoteIdentityState) =>
    remoteIdentityState.remoteIdentities.map(
      (identityId) => remoteIdentityState.remoteIdentitiesById[identityId]
    )
);
