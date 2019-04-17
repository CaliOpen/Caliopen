import throttle from 'lodash.throttle';
import { v4 as uuidv4 } from 'uuid';
import isEqual from 'lodash.isequal';
import { calcSyncDraft } from '../services/calcSyncDraft';
import { updateMessage } from '../../../store/actions/message';
import { createMessage } from '../../message';
import { editDraft as editDraftBase, syncDraft } from '../../../store/modules/draft-message';

const UPDATE_WAIT_TIME = 5 * 1000;

const createDraft = ({ internalId, draft = { message_id: uuidv4() } }) => async (dispatch) => {
  try {
    const message = await dispatch(createMessage({ message: draft }));
    const nextDraft = calcSyncDraft({ draft, message });
    dispatch(syncDraft({ internalId, draft: nextDraft }));

    return message;
  } catch (err) {
    return Promise.reject(err);
  }
};

const updateDraft = ({ internalId, draft, message }) => async (dispatch) => {
  try {
    const messageUpToDate = await dispatch(updateMessage({ message: draft, original: message }));
    const nextDraft = calcSyncDraft({ draft, message });
    dispatch(syncDraft({ internalId, draft: nextDraft }));

    return messageUpToDate;
  } catch (err) {
    return Promise.reject(err);
  }
};

const createOrUpdateDraft = ({ internalId, draft, message }) => (dispatch) => {
  // XXX: look for participants with no associated contact and search for eventual contacts
  // usefull for brand new draft with manual addresses set
  // https://trello.com/c/uCA80Wln/209-an-api-to-find-a-contact-according-to-an-address
  if (message) {
    return dispatch(updateDraft({ internalId, draft, message }));
  }

  return dispatch(createDraft({ internalId, draft }));
};

const throttled = {};
const createThrottle = (resolve, reject, dispatch, { internalId, draft, message }) => (
  throttle(async () => {
    throttled[internalId] = undefined;

    try {
      const messageUpToDate = await dispatch(createOrUpdateDraft({ internalId, draft, message }));
      resolve(messageUpToDate);
    } catch (err) {
      reject(err);
    }
  }, UPDATE_WAIT_TIME, { leading: false })
);

export const saveDraft = (
  { internalId, draft, message },
  { withThrottle = false, force = false } = {}
) => dispatch => new Promise(async (resolve, reject) => {
  if (isEqual(message, draft)) {
    resolve(message);

    return;
  }

  if (throttled[internalId]) {
    throttled[internalId].cancel();
  }
  dispatch(editDraftBase({ internalId, draft, message }));
  const { body, participants } = draft;
  if (body.length === 0 && (!participants || participants.length === 0) && force === false) {
    resolve(draft);

    return;
  }

  if (!withThrottle) {
    try {
      const messageUpToDate = await dispatch(createOrUpdateDraft({ internalId, draft, message }));
      resolve(messageUpToDate);
    } catch (err) {
      reject(err);
    }

    return;
  }

  throttled[internalId] = createThrottle(resolve, reject, dispatch, { internalId, draft, message });
  throttled[internalId]();
});
