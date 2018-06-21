import { tryCatchAxiosAction } from '../../../services/api-client';
import { requestDraft } from '../../../store/modules/message';
import { draftSelector } from '../selectors/draftSelector';

export const getDraft = ({ discussionId }) => async (dispatch, getState) => {
  let draft = draftSelector(getState(), { discussionId });

  if (draft) {
    return draft;
  }

  const response = await tryCatchAxiosAction(() =>
    dispatch(requestDraft({ discussionId })));
  [draft] = response.messages;

  return draft;
};
