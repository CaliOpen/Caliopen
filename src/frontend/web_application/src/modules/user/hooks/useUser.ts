import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestUser } from 'src/store/modules/user';
import { userStateSelector } from '../selectors/userStateSelector';
import { isAuthenticated } from '../services/isAuthenticated';

type User = any;

const shouldFetchSelector = (state) => {
  const { user, isFetching, didInvalidate } = userStateSelector(state);

  return (!user || didInvalidate) && !isFetching;
};

const getUser = () => async (dispatch, getState) => {
  if (shouldFetchSelector(getState())) {
    await dispatch(requestUser());
  }

  return userStateSelector(getState()).user;
};

export function useUser(): void | User {
  const dispatch = useDispatch();
  const { user } = useSelector(userStateSelector);
  const shouldFetch = useSelector(shouldFetchSelector);
  const authenticated = isAuthenticated();

  React.useEffect(() => {
    if (shouldFetch && authenticated) {
      dispatch(getUser());
    }
  }, [shouldFetch, dispatch, authenticated]);

  return user;
}
