import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { settingsSelector } from '../selectors/settings';
import { requestSettings } from 'src/store/modules/settings';
import { isAuthenticated } from 'src/modules/user';

interface Settings {
  [key: string]: any;
}

const isToFetchSelector = (state) => {
  const { settings, isFetching, isInvalidated, didLostAuth } = settingsSelector(
    state
  );

  return (!settings || isInvalidated || didLostAuth) && !isFetching;
};

const getSettings = () => async (dispatch, getState) => {
  if (isToFetchSelector(getState())) {
    await dispatch(requestSettings());
  }

  return settingsSelector(getState()).settings;
};

export function useSettings(): Settings {
  const dispatch = useDispatch();
  const { settings } = useSelector(settingsSelector);
  const isToFetch = useSelector(isToFetchSelector);

  React.useEffect(() => {
    if (isToFetch && isAuthenticated()) {
      dispatch(getSettings());
    }
  }, [isToFetch, dispatch]);

  return settings;
}
