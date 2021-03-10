import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestUser } from '../store/reducer';
import { shouldFetchSelector, stateSelector } from '../store/selectors';
import { isAuthenticated } from '../services/isAuthenticated';

export function useUser() {
  const dispatch = useDispatch();
  const { user, didLostAuth, status, initialized } = useSelector(stateSelector);
  const shouldFetch = useSelector(shouldFetchSelector);
  const authenticated = isAuthenticated();

  React.useEffect(() => {
    if (shouldFetch && authenticated) {
      dispatch(requestUser());
    }
  }, [shouldFetch, dispatch, authenticated]);

  return { initialized, status, didLostAuth, user };
}
