import {
  deleteRemoteIdentity as deleteRemoteIdentityBase,
  removeFromCollection,
} from '../../../store/modules/remote-identity';
import { tryCatchAxiosAction } from '../../../services/api-client';

export const deleteIdentity = ({ identity }) => async (dispatch) => {
  await tryCatchAxiosAction(() =>
    dispatch(deleteRemoteIdentityBase({ remoteIdentity: identity }))
  );

  return dispatch(removeFromCollection({ remoteIdentity: identity }));
};
