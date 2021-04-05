import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { shouldFetchSelector, stateSelector } from '../store/selectors';
import { eventuallyFetchTags } from '../actions/fetchTags';
import { useRequest } from 'redux-query-react';
import { RootState } from 'src/store/reducer';
import { getSignatureHeaders } from 'src/modules/device/services/signature';

const tagsSelector = (state: RootState) => state.entities.tags;

const getQueryConfig = () => {
  // const signatureHeaders = await getSignatureHeaders(req, device);

  const tagsQueryConfig = {
    url: '/api/v2/tags',
    // options: {
    //   headers: {
    //     'X-Caliopen-IL': `-10;10`,
    //     'X-Caliopen-PI': '0;100',
    //     'X-Requested-With': 'XMLHttpRequest',
    //   },
    // },
    update: {
      tags: (oldValue, newValue) => newValue,
    },
  };

  return tagsQueryConfig;
};

const invalidate = () => {};

export function useTags() {
  // const dispatch = useDispatch();

  // const { initialized, status, tags } = useSelector(stateSelector);
  const tags = useSelector(tagsSelector);
  // const shouldFetch = useSelector(shouldFetchSelector);

  const [queryState] = useRequest(getQueryConfig());

  console.log(queryState);
  const initialized = (queryState.queryCount || 0) > 0 && !queryState.isPending;

  // React.useEffect(() => {
  //   if (shouldFetch) {
  //     dispatch(eventuallyFetchTags());
  //   }
  // }, [shouldFetch]);

  return {
    initialized,
    statusCode: queryState.status,
    isPending: queryState.isPending,
    tags,
  };
}
