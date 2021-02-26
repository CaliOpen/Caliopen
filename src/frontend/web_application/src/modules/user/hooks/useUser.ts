import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestUser } from '../store/reducer';
import { stateSelector } from '../store/selectors';
import { isAuthenticated } from '../services/isAuthenticated';

const shouldFetchSelector = (state) => {
  const { user, isFetching, didInvalidate } = stateSelector(state);

  return (!user || didInvalidate) && !isFetching;
};

const getUser = () => async (dispatch, getState) => {
  if (shouldFetchSelector(getState())) {
    await dispatch(requestUser());
  }

  return stateSelector(getState()).user;
};

export function useUser() {
  const dispatch = useDispatch();
  const { user, didLostAuth, isFetching } = useSelector(stateSelector);
  const shouldFetch = useSelector(shouldFetchSelector);
  const authenticated = isAuthenticated();

  React.useEffect(() => {
    if (shouldFetch && authenticated) {
      dispatch(getUser());
    }
  }, [shouldFetch, dispatch, authenticated]);

  return { isFetching, didLostAuth, user };
}
