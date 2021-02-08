import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIdentities } from '../actions/getIdentities';
import { identitiesSelector } from '../selectors/identitiesSelector';

const remoteIdentitystateSelector = (state) => state.remoteIdentity;
const localIdentityStateSelector = (state) => state.localIdentity;

export function useIdentities(): {
  identities: Array<any>;
  isFetching: boolean;
} {
  const dispatch = useDispatch();
  const { remoteIsFetching } = useSelector(remoteIdentitystateSelector);
  const { localIsFetching } = useSelector(localIdentityStateSelector);
  const identities = useSelector(identitiesSelector);
  const isFetching = remoteIsFetching || localIsFetching;

  // TODO: invalidated
  React.useEffect(() => {
    if (!isFetching) {
      dispatch(getIdentities());
    }
  }, []);

  return {
    identities,
    isFetching,
  };
}
