import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  messageSelector,
  shouldFetchSelector,
} from '../selectors/messageSelector';
import { getMessage } from '../actions/getMessage';

export function useMessage(messageId: string) {
  const dispatch = useDispatch();
  const shouldFetch = useSelector((state) =>
    shouldFetchSelector(state, messageId)
  );
  const message = useSelector((state) => messageSelector(state, { messageId }));

  React.useEffect(() => {
    if (shouldFetch) {
      dispatch(dispatch(getMessage({ messageId })));
    }
  }, [shouldFetch]);

  return {
    message,
  };
}
