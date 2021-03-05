import { createSelector } from 'reselect';
import { RootState } from 'src/store/reducer';

export const draftMessagesSelector = createSelector(
  (state: RootState) => state.draftMessage,
  (draftMessageState) =>
    Object.keys(draftMessageState.draftsByMessageId).map(
      (messageid) => draftMessageState.draftsByMessageId[messageid]
    )
);

export const draftMessageSelector = (state: RootState, messageId: string) =>
  state.draftMessage.draftsByMessageId[messageId];

export function discussionDraftSelector(
  state: RootState,
  discussionId: string
) {
  return Object.keys(state.draftMessage.draftsByMessageId)
    .map((id) => state.draftMessage.draftsByMessageId[id])
    .filter(Boolean)
    .find((draft) => draft.discussion_id === discussionId);
}
