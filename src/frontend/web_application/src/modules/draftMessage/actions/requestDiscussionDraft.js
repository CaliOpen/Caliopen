import { v4 as uuidv4 } from 'uuid';
import { draftSelector } from '../selectors/draft';
import { requestDraft, requestDraftSuccess } from '../../../store/modules/draft-message';
import { newDraft } from './newDraft';
import { getDraft, getLastMessage } from '../../message';

export const requestDiscussionDraft = ({ internalId = uuidv4(), discussionId }) =>
  async (dispatch, getState) => {
    let draft = draftSelector(getState(), { internalId });

    if (draft) {
      return draft;
    }

    dispatch(requestDraft({ internalId }));
    draft = await dispatch(getDraft({ discussionId }));

    if (draft) {
      dispatch(requestDraftSuccess({ internalId, draft }));

      return draft;
    }

    draft = {};

    const messageInReply = await dispatch(getLastMessage({ discussionId })) || {};

    draft = {
      discussion_id: discussionId,
      subject: messageInReply.subject || '',
      parent_id: messageInReply.message_id || '',
    };

    draft = await dispatch(newDraft({ internalId, draft }));
    dispatch(requestDraftSuccess({ internalId, draft }));

    return draft;
  };
