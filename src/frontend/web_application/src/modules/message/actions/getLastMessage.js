import { discussionIdSelector } from '../../discussion';
import { fetchMessages } from './fetchMessages';
import { createMessageCollectionStateSelector } from '../../../store/selectors/message';
import { sortMessages } from '../services/sortMessages';

const messageCollectionSelector = createMessageCollectionStateSelector(
  () => 'discussion',
  discussionIdSelector
);

export const getLastMessage = ({ discussionId }) => async (
  dispatch,
  getState
) => {
  const { messages } = messageCollectionSelector(getState(), { discussionId });
  messages.sort((a, b) => (new Date(a.date_sort) - new Date(b.date_sort)) * -1);
  let [lastMessage] = sortMessages(messages, true);

  if (lastMessage) {
    return lastMessage;
  }

  [lastMessage] = await dispatch(
    fetchMessages({
      discussion_id: discussionId,
      is_draft: false,
      limit: 1,
    })
  );

  return lastMessage;
};
