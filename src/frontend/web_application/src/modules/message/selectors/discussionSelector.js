import { createSelector } from 'reselect';
import { messagesByIdSelector } from '../../../store/selectors/message';

const discussionIdSelector = (state, { discussionId }) => {
  if (!discussionId) {
    throw new Error('discussionId must be passed when calling discussionSelector, e.g discussionSelector(state, { discussionId })');
  }

  return discussionId;
};

export const discussionSelector = createSelector(
  [messagesByIdSelector, discussionIdSelector],
  (messagesById, discussId) => {
    const results = Object.keys(messagesById)
      .filter(messageId =>
        messagesById[messageId] && messagesById[messageId].discussion_id === discussId)
      .map(messageId => messagesById[messageId]);

    return results;
  }
);
