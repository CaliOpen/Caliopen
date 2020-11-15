import { saveDraft } from './saveDraft';
import { createDiscussionDraft } from './requestDraft';
import { getDraft, Message } from '../../message';
import { mapMessageToDraftMessageFormData } from '../models';

export const reply = (messageInReply) => async (dispatch): Promise<Message> => {
  // in a discussion, I want to reply to a message

  // find the draft if any for the discussion
  // or create new draft
  // set the parent and save

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

  return dispatch(saveDraft(mapMessageToDraftMessageFormData(draft)));
};
