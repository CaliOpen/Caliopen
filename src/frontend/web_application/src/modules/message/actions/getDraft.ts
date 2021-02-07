import { handleClientResponseSuccess } from '../../../services/api-client';
import { requestDraft } from '../../../store/modules/message';
// prevent circular reference to something in unit tests
import { discussionDraftSelector } from '../../discussion/selectors/discussionDraftSelector';
import { Message } from '../models/Message';

export const getDraft = ({ discussionId }: { discussionId: string }) => async (
  dispatch,
  getState
): Promise<void | Message> => {
  let draft = discussionDraftSelector(getState(), { discussionId });

  if (draft) {
    return draft;
  }

  try {
    const data = handleClientResponseSuccess(
      await dispatch(requestDraft({ discussionId }))
    );
    [draft] = data.messages;

    return draft;
  } catch (error) {
    if (error.error.response.status === 404) {
      return undefined;
    }

    throw error;
  }
};
