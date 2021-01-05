import { postActions, requestMessage } from '../../../store/modules/message';
import { messagesByIdSelector } from '../../../store/selectors/message';
import { clearDraft } from '../../../store/modules/draft-message';
import { Message } from 'src/modules/message';

export const sendDraft = (draft: Message) => async (
  dispatch,
  getState
): Promise<Message> => {
  try {
    // discussion_id is set after the message has been sent for new drafts
    await dispatch(postActions({ message: draft, actions: ['send'] }));
    await dispatch(requestMessage(draft.message_id));

    const messageUpToDate = messagesByIdSelector(getState())[draft.message_id];

    dispatch(clearDraft({ draft }));

    return messageUpToDate;
  } catch (err) {
    return Promise.reject(err);
  }
};
