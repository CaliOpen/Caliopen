import { requestLocalIdentities } from '../../../store/modules/local-identity';

export const getLocalIdentities = () => async (dispatch, getState) => {
  const { localIdentities, didInvalidate } = getState().localIdentity;

  if (localIdentities.length > 0 && !didInvalidate) {
    return localIdentities;
  }

  await dispatch(requestLocalIdentities());

  return getState().localIdentity.localIdentities;
};
