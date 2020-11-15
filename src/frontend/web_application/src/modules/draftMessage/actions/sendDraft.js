import { postActions, requestMessage } from '../../../store/modules/message';
import { messagesByIdSelector } from '../../../store/selectors/message';
import { clearDraft } from '../../../store/modules/draft-message';
import { saveDraft } from './saveDraft';

export const sendDraft = ({ draft }) => async (dispatch, getState) => {
  try {
    const savedMessage = await dispatch(
      saveDraft(
        { draft },
        {
          withThrottle: false,
        }
      )
    );
    // discussion_id is set after the message has been sent for new drafts
    await dispatch(postActions({ draft, actions: ['send'] }));
    await dispatch(requestMessage(draft.message_id));

    const messageUpToDate = messagesByIdSelector(getState())[draft.message_id];

    dispatch(clearDraft({ draft }));

    return messageUpToDate;
  } catch (err) {
    return Promise.reject(err);
  }
};
