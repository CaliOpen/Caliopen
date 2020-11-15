import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userStateSelector } from '../selectors/userStateSelector';
import { requestUser } from 'src/store/modules/user';
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

export function useUser(): User {
  const dispatch = useDispatch();
  const { user } = useSelector(userStateSelector);
  const shouldFetch = useSelector(shouldFetchSelector);

  React.useEffect(() => {
    if (shouldFetch && isAuthenticated()) {
      dispatch(getUser());
    }
  }, [shouldFetch, dispatch]);

  return user;
}
