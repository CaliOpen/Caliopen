import { createSelector } from 'reselect';
import { getModuleStateSelector } from '../../../store/selectors/getModuleStateSelector';

export const identitiesSelector = createSelector(
  [
    getModuleStateSelector('remoteIdentity'),
    getModuleStateSelector('localIdentity'),
  ],
  ({ remoteIdentities, remoteIdentitiesById }, { localIdentities }) => [
    ...remoteIdentities.map((identityId) => remoteIdentitiesById[identityId]),
    ...localIdentities,
  ]
);
