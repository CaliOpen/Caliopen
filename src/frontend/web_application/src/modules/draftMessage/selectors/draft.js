import { createSelector } from 'reselect';
import { createMessageCollectionStateSelector } from '../../../store/selectors/message';

const messageCollectionSelector = createMessageCollectionStateSelector(
  () => 'discussion',
  (state, { discussionId }) => discussionId
);

export const draftMessagesSelector = createSelector(
  (state) => state.draftMessage,
  (draftMessageState) =>
    Object.keys(draftMessageState.draftsByMessageId).map(
      (messageid) => draftMessageState.draftsByMessageId[messageid]
    )
);

export const draftMessageSelector = (state, messageId) =>
  state.draftMessage.draftsByMessageId[messageId];

export function discussionDraftSelector(state, discussionId) {
  return Object.keys(state.draftMessage.draftsByMessageId)
    .map((id) => state.draftMessage.draftsByMessageId[id])
    .find((draft) => draft.discussion_id === discussionId);
}
