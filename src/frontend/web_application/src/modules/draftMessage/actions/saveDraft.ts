import throttle from 'lodash.throttle';
import { v4 as uuidv4 } from 'uuid';
import isEqual from 'lodash.isequal';
import { calcSyncDraft } from '../services/calcSyncDraft';
import { updateMessage } from '../../../store/actions/message';
import { createMessage, getMessage, Message } from '../../message';
import {
  editDraft as editDraftBase,
  syncDraft,
} from '../../../store/modules/draft-message';
import { consolidateParticipants } from './consolidateParticipants';
import {
  DraftMessageFormData,
  mapDraftMessageFormDataToMessage,
} from '../models';
import { IDraftMessagePayload } from 'src/modules/message/types';

const UPDATE_WAIT_TIME = 5 * 1000;

const createDraft = (draftMessage: IDraftMessagePayload) => async (
  dispatch
): Promise<Message> => {
  try {
    const message = await dispatch(createMessage({ message: draftMessage }));
    const nextDraft = calcSyncDraft(draftMessage, message);
    dispatch(syncDraft(nextDraft));

    return message;
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateDraft = (
  draftMessage: IDraftMessagePayload,
  message: Message
) => async (dispatch): Promise<Message> => {
  try {
    const messageUpToDate = await dispatch(
      updateMessage({ message: draftMessage, original: message })
    );
    const nextDraft = calcSyncDraft(draftMessage, message);
    dispatch(syncDraft(nextDraft));

    return messageUpToDate;
  } catch (err) {
    return Promise.reject(err);
  }
};

const createOrUpdateDraft = (draftMessage: IDraftMessagePayload) => async (
  dispatch
): Promise<Message> => {
  const participants = await dispatch(
    consolidateParticipants(draftMessage.participants)
  );
  const consolidatedDraft = { ...draftMessage, participants };

  let message;
  try {
    message = await dispatch(
      getMessage({ messageId: draftMessage.message_id })
    );
  } catch (err) {
    // new draft: nothing to do
  }

  if (message) {
    return dispatch(updateDraft(consolidatedDraft, message));
  }

  return dispatch(createDraft(consolidatedDraft));
};

const throttled = {};
const createThrottle = (
  resolve,
  reject,
  dispatch,
  draftMessage: IDraftMessagePayload
) =>
  throttle(
    async () => {
      throttled[draftMessage.message_id || 'current'] = undefined;

      try {
        const messageUpToDate = await dispatch(
          createOrUpdateDraft(draftMessage)
        );
        resolve(messageUpToDate);
      } catch (err) {
        reject(err);
      }
    },
    UPDATE_WAIT_TIME,
    { leading: false }
  );

export const saveDraft = (
  draft: DraftMessageFormData,
  {
    withThrottle = false,
    force = false,
  }: { withThrottle?: boolean; force?: boolean } = {}
) => async (dispatch, getState): Promise<void | Message> => {
  dispatch(editDraftBase(draft));

  if (throttled[draft.message_id]) {
    throttled[draft.message_id].cancel();
  }

  const { body, recipients } = draft;

  if (
    body.length === 0 &&
    (!recipients || recipients.length === 0) &&
    force === false
  ) {
    // do not create draft until body & recipients are filled
    return undefined;
  }

  const draftMessage = mapDraftMessageFormDataToMessage(draft);

  if (!withThrottle) {
    return dispatch(createOrUpdateDraft(draftMessage));
  }

  return new Promise((resolve, reject) => {
    throttled[draft.message_id] = createThrottle(
      resolve,
      reject,
      dispatch,
      draftMessage
    );
    throttled[draft.message_id]();
  });
};
