import {
  createRemoteIdentity as createRemoteIdentityBase,
  requestRemoteIdentity,
  addToCollection,
} from '../../../store/modules/remote-identity';
import { tryCatchAxiosAction } from '../../../services/api-client';

export const createIdentity = ({ identity }) => async (dispatch) => {
  // FIXME: it should be identity_id
  const { remote_id: identityId } = await tryCatchAxiosAction(() =>
    dispatch(createRemoteIdentityBase({ remoteIdentity: identity }))
  );

  const remoteIdentityUpToDate = await tryCatchAxiosAction(() =>
    dispatch(requestRemoteIdentity({ identityId }))
  );

  await dispatch(addToCollection({ remoteIdentity: remoteIdentityUpToDate }));

  return remoteIdentityUpToDate;
};
