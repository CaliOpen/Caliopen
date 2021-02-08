import { tryCatchAxiosAction } from '../../../services/api-client';
import { requestDiscussion as requestDiscussionBase } from '../../../store/modules/discussion';
import { requestMessages as requestMessagesBase } from '../../../store/modules/message';
import { discussionSelector } from '../../discussion';

export const requestDiscussion = ({ discussionId }) => async (
  dispatch,
  getState
) => {
  // the discussion can be outdated but not the message's collection
  const discussion = discussionSelector(getState(), { discussionId });

  const results = await Promise.all([
    discussion
      ? { discussion }
      : tryCatchAxiosAction(() =>
          dispatch(requestDiscussionBase({ discussionId }))
        ),
    dispatch(
      requestMessagesBase('discussion', discussionId, {
        discussion_id: discussionId,
      })
    ),
  ]);

  return results[0];
};
