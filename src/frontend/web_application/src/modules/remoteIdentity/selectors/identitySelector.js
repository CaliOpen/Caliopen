import { createSelector } from 'reselect';
import { identityStateSelector } from './identityStateSelector';

export const identitySelector = createSelector(
  [identityStateSelector, (state, { identityId }) => identityId],
  (remoteIdentityState, identityId) =>
    remoteIdentityState.remoteIdentitiesById[identityId]
);
