import { createSelector } from 'reselect';
import { State } from 'src/store/modules/draft-message';
import { createMessageCollectionStateSelector } from '../../../store/selectors/message';
import { DraftMessageFormData } from '../models';

interface FullState {
  draftMessage: State;
}

export const draftMessagesSelector = createSelector(
  (state: FullState) => state.draftMessage,
  (draftMessageState) =>
    Object.keys(draftMessageState.draftsByMessageId).map(
      (messageid) => draftMessageState.draftsByMessageId[messageid]
    )
);

export const draftMessageSelector = (state: FullState, messageId: string) =>
  state.draftMessage.draftsByMessageId[messageId];

export function discussionDraftSelector(
  state: FullState,
  discussionId: string
) {
  return Object.keys(state.draftMessage.draftsByMessageId)
    .map((id) => state.draftMessage.draftsByMessageId[id])
    .filter(Boolean)
    .find((draft) => draft.discussion_id === discussionId);
}
