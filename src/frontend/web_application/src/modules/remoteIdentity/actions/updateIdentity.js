import {
  updateRemoteIdentity as updateRemoteIdentityBase,
  requestRemoteIdentity,
} from '../../../store/modules/remote-identity';
import { tryCatchAxiosAction } from '../../../services/api-client';
import { identitySelector } from '../selectors/identitySelector';

export const updateIdentity = ({ identity }) => async (dispatch, getState) => {
  const { identity_id: identityId } = identity;
  const original = identitySelector(getState(), { identityId });

  try {
    await tryCatchAxiosAction(() =>
      dispatch(
        updateRemoteIdentityBase({
          remoteIdentity: identity,
          original,
        })
      )
    );

    const remoteIdentityUpToDate = await tryCatchAxiosAction(() =>
      dispatch(requestRemoteIdentity({ identityId }))
    );

    return remoteIdentityUpToDate;
  } catch (err) {
    return Promise.reject(err);
  }
};
