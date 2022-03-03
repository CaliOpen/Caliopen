import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResourceStatus } from 'src/types';
import { RootState } from 'src/store/reducer';
import { shouldFetchSelector, stateSelector } from '../store/selectors';
import { eventuallyFetchTags } from '../actions/fetchTags';

interface HookRes {
  initialized: boolean;
  status: ResourceStatus;
  tags: RootState['tag']['tags'];
}
export function useTags(): HookRes {
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
