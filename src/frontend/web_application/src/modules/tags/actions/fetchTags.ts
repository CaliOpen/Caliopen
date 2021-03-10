import { tryCatchAxiosAction } from '../../../services/api-client';
import { requestTags } from '../store/reducer';
import { shouldFetchSelector, stateSelector } from '../store/selectors';

export const eventuallyFetchTags = () => async (dispatch, getState) => {
  const shouldFetch = shouldFetchSelector(getState());

  if (!shouldFetch) {
    return Promise.resolve();
  }

  return tryCatchAxiosAction(() => dispatch(requestTags()));
};
