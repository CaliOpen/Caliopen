import { fetchMessages } from './fetchMessages';
import { discussionSelector } from '../selectors/discussionSelector';

export const getLastMessage = ({ discussionId }) => async (dispatch, getState) => {
  let [lastMessage] = discussionSelector(getState(), { discussionId })
    .sort((a, b) => a.date_sort < b.date_sort);

  if (lastMessage) {
    return lastMessage;
  }

  [lastMessage] = await dispatch(fetchMessages({
    discussion_id: discussionId,
    is_draft: false,
    limit: 1,
  }));

  return lastMessage;
};
