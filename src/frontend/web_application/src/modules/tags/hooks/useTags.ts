import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { shouldFetchSelector, stateSelector } from '../store/selectors';
import { eventuallyFetchTags } from '../actions/fetchTags';

export function useTags() {
  const dispatch = useDispatch();

  const { initialized, status, tags } = useSelector(stateSelector);

  const shouldFetch = useSelector(shouldFetchSelector);

  React.useEffect(() => {
    if (shouldFetch) {
      dispatch(eventuallyFetchTags());
    }
  }, [shouldFetch]);

  return {
    initialized,
    status,
    tags,
  };
}
