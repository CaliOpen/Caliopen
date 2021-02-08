import { requestDiscussionByParticipants } from '../../../store/modules/discussion';
import { tryCatchAxiosAction } from '../../../services/api-client';
import { getModuleStateSelector } from '../../../store/selectors/getModuleStateSelector';

export const requestDiscussionIdForParticipants = ({
  participants,
  internalHash,
}) => async (dispatch, getState) => {
  const { discussionId } =
    getModuleStateSelector('discussion')(getState())
      .discussionByParticipantsHash[internalHash] || {};
  if (discussionId) {
    return discussionId;
  }

  try {
    const result = await tryCatchAxiosAction(() =>
      dispatch(requestDiscussionByParticipants({ participants, internalHash }))
    );

    return result.discussion_id;
  } catch (e) {
    return undefined;
  }
};
