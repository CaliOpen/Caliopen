import { saveDraft } from './saveDraft';
import { createDiscussionDraft } from './requestDraft';
import { getDraft, Message, messageSelector } from '../../message';
import { mapMessageToDraftMessageFormData } from '../models';

/**
 * In a discussion, I want to reply to a message
 * find the draft if any for the discussion
 * or create new draft
 * set the parent and save
 *
 * @param messageInReply Message
 */
export const reply = (messageInReply: Message) => async (
  dispatch,
  getState
): Promise<Message> => {
  const discussionId = messageInReply.discussion_id;
  let draft = await dispatch(getDraft({ discussionId }));

  if (!draft) {
    draft = await dispatch(
      createDiscussionDraft({
        discussionId,
        values: {
          parent_id: messageInReply.message_id,
        },
      })
    );
  } else {
    // FIXME: change subject & co?
    draft = { ...draft, parent_id: messageInReply.message_id };
  }

  await dispatch(
    saveDraft(mapMessageToDraftMessageFormData(draft), {
      withThrottle: false,
      force: true,
    })
  );
  const message = messageSelector(getState(), { messageId: draft.message_id });

  return message;
};
