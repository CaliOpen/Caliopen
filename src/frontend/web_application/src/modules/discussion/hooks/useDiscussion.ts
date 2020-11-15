import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestDiscussion } from 'src/store/modules/discussion';
import {
  discussionSelector,
  shouldFetchSelector,
} from '../selectors/discussionSelector';
import { isFetchingSelector } from '../selectors/discussionsSelector';

export function useDiscussion(discussionId: string) {
  const dispatch = useDispatch();
  const shouldFetch = useSelector((state) =>
    shouldFetchSelector(state, discussionId)
  );
  const isFetching = useSelector(isFetchingSelector);
  const discussion = useSelector((state) =>
    discussionSelector(state, { discussionId })
  );

  React.useEffect(() => {
    if (shouldFetch) {
      dispatch(requestDiscussion({ discussionId }));
    }
  }, [shouldFetch]);

  return {
    discussion,
    isFetching,
  };
}
