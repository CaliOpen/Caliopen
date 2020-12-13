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
  const draftMessage = await dispatch(getDraft({ discussionId }));

  // FIXME: change subject & co? (not only parent_id)
  const draft = draftMessage
    ? {
        ...mapMessageToDraftMessageFormData(draftMessage),
        parent_id: messageInReply.message_id,
      }
    : await dispatch(
        createDiscussionDraft({
          discussionId,
          values: {
            parent_id: messageInReply.message_id,
          },
        })
      );

  await dispatch(
    saveDraft(draft, {
      withThrottle: false,
      force: true,
    })
  );
  const message = messageSelector(getState(), { messageId: draft.message_id });

  return message;
};
