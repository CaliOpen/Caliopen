import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import sha1 from 'uuid/lib/sha1-browser';
import bytesToUuid from 'uuid/lib/bytesToUuid';
import { getModuleStateSelector } from 'src/store/selectors/getModuleStateSelector';
import { createMessageCollectionStateSelector } from 'src/store/selectors/message';
import { draftMessageSelector } from 'src/modules/draftMessage';
import { requestDiscussionIdForParticipants , discussionSelector as discussionSelectorBase } from 'src/modules/discussion';
import { requestDiscussion , getMessage } from 'src/modules/message';



const getParticipantsHash = ({ participants }) => {
  if (participants.length === 0) {
    return undefined;
  }

  return bytesToUuid(
    sha1(
      participants
        .map((participant) => `${participant.address}_${participant.protocol}`)
        .sort()
        .join('+')
    )
  );
};
const discussionStateSelector = getModuleStateSelector('discussion');

const discussionIdSelector = (state, messageId: string) => {
  const discussionState = discussionStateSelector(state);
  const draftMessage = draftMessageSelector(state, messageId);
  if (
    !draftMessage ||
    !draftMessage.participants ||
    draftMessage.participants.length === 0
  ) {
    return undefined;
  }

  const { participants } = draftMessage;
  const discussionId =
    discussionState.discussionByParticipantsHash[
      getParticipantsHash({
        participants,
      })
    ]?.discussionId;

  return discussionId;
};

const discussionSelector = (state, messageId: string) =>
  discussionSelectorBase(state, {
    discussionId: discussionIdSelector(state, messageId),
  });

const messageCollectionStateSelector = createMessageCollectionStateSelector(
  () => 'discussion',
  discussionIdSelector
);

const requestDraftDiscussion = (messageId: string) => async (dispatch) => {
  const draftMessage = await dispatch(getMessage({ messageId })).catch(
    () => undefined
  );

  if (!draftMessage) {
    return;
  }

  const { participants } = draftMessage;
  const internalHash = getParticipantsHash({ participants });

  const discussionId = await dispatch(
    requestDiscussionIdForParticipants({
      participants,
      internalHash,
    })
  );
  if (discussionId && discussionId.length > 0) {
    dispatch(requestDiscussion({ discussionId }));
  }
};

const EMPTY_ARRAY = [];

/**
 * This hook relies on draftMessage participants to get the discussion and the related messages.
 * @param messageId string
 */
export function useDraftDiscussion(messageId: string) {
  const dispatch = useDispatch();

  const draftMessage = useSelector((state) =>
    draftMessageSelector(state, messageId)
  );
  const discussion = useSelector((state) =>
    discussionSelector(state, messageId)
  );

  const messageCollectionState = useSelector(
    // @ts-ignore: messageId is required by discussionIdSelector
    (state) => discussion && messageCollectionStateSelector(state, messageId)
  );

  const { messages, didInvalidate, isFetching } = messageCollectionState || {};

  const shouldFetchDraftMessage =
    !isFetching && (didInvalidate || !draftMessage || !messageCollectionState);

  React.useEffect(() => {
    if (shouldFetchDraftMessage) {
      dispatch(requestDraftDiscussion(messageId));
    }
  }, [shouldFetchDraftMessage, messageId]);

  return {
    discussion,
    messages: (messages || EMPTY_ARRAY).filter(
      (message) => message.message_id !== messageId
    ),
  };
}
