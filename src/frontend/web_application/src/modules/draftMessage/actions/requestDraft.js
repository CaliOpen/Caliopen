import {
  requestDraftSuccess,
  createDraft,
  syncDraft,
} from '../../../store/modules/draft-message';
import {
  getDraft as getDiscussionDraftBase,
  getMessage,
  getLastMessage,
  Message,
} from '../../message';
import { getUser } from '../../user';
import { getDefaultIdentity } from './getDefaultIdentity';
import { changeAuthorInParticipants } from '../services/changeAuthorInParticipants';
import {
  DraftMessageFormData,
  mapMessageToDraftMessageFormData,
} from '../models';

export const createDiscussionDraft = ({ discussionId, values }) => async (
  dispatch
) => {
  const [parentMessage, user] = await Promise.all([
    values.parent_id
      ? dispatch(getMesage({ messageId: values.parent_id }))
      : dispatch(getLastMessage({ discussionId })),
    dispatch(getUser()),
  ]);
  const { participants, protocol } = parentMessage;
  const identity = await dispatch(
    getDefaultIdentity({ participants, protocol })
  );
  const newDraft = new DraftMessageFormData({
    // discussion_id is never saved for a draft, it is set by the backend when the message is sent
    // rollback 5fb2eb667210cfe8336b03d48efb5a350ccf32cd and await for new discussion algo (still
    // not working with current API)
    // XXX: the next API will give the discussionId according to participants
    // may be better to give the participants and the getDraftDefault identity according to the
    // discussionId?
    // how to deal w/ no network capability?
    discussion_id: discussionId,
    subject: parentMessage.subject || '',
    parent_id: parentMessage.message_id,
    user_identities: identity ? [identity.identity_id] : [],
    recipients: changeAuthorInParticipants({
      participants: parentMessage.participants,
      user,
      identity,
    }),
    identity_id: identity?.identity_id,
    ...values,
  });

  await dispatch(createDraft({ draft: newDraft }));
  dispatch(requestDraftSuccess({ draft: newDraft }));

  return newDraft;
};

export const getOrCreateDiscussionDraft = ({ discussionId }) => async (
  dispatch
) => {
  const draft = await dispatch(getDiscussionDraftBase({ discussionId }));

  if (draft) {
    dispatch(
      requestDraftSuccess({
        draft,
      })
    );

    return draft;
  }

  return dispatch(createDiscussionDraft({ discussionId, values: {} }));
};

export const getSimpleDraft = ({ messageId }) => async (dispatch) => {
  try {
    const message = await Promise.resolve(dispatch(getMessage({ messageId })));
    dispatch(
      requestDraftSuccess({ draft: mapMessageToDraftMessageFormData(message) })
    );
    dispatch(syncDraft(mapMessageToDraftMessageFormData(message)));

    return message;
  } catch (err) {
    const identity = await dispatch(getDefaultIdentity());
    const newDraft = new DraftMessageFormData({
      message_id: messageId,
      user_identities: identity ? [identity.identity_id] : [],
    });
    await dispatch(createDraft({ draft: newDraft }));
    dispatch(requestDraftSuccess({ draft: newDraft }));
    dispatch(syncDraft(newDraft));

    return newDraft;
  }
};
