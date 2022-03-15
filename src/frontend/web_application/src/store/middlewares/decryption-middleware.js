import { decryptMessage } from '../../modules/encryption';
// Renaming REQUEST_DRAFT_SUCCESS actions for disambiguation.
import {
  decryptDraftSuccess,
  // REQUEST_DRAFT_SUCCESS as DRAFT_REQUEST_DRAFT_SUCCESS,
} from '../modules/draft-message';
import {
  FETCH_MESSAGES_SUCCESS,
  REQUEST_MESSAGE_SUCCESS,
  REQUEST_MESSAGES_SUCCESS,
  REQUEST_DRAFT_SUCCESS as MESSAGE_REQUEST_DRAFT_SUCCESS,
} from '../modules/message';
import {
  setPassphraseSuccess,
  resetPassphrase,
  SET_PASSPHRASE,
  SET_PASSPHRASE_SUCCESS,
} from '../modules/encryption';

const extractMessagesFromAction = ({ payload, type }) => {
  switch (type) {
    // case DRAFT_REQUEST_DRAFT_SUCCESS:
    //   return [payload.draft];
    case REQUEST_MESSAGE_SUCCESS:
      return [payload.data];
    case REQUEST_MESSAGES_SUCCESS:
    case FETCH_MESSAGES_SUCCESS:
    case MESSAGE_REQUEST_DRAFT_SUCCESS:
      return payload.data.messages;
    default:
      return [];
  }
};

const decryptMessages =
  ({ messages }) =>
  async (dispatch) => {
    if (messages.length <= 0) return messages;

    return Promise.all(
      messages.map((message) => dispatch(decryptMessage({ message })))
    );
  };

const findMessagesEncryptedWithKey = (state, fingerprint) => {
  const { messageEncryptionStatusById } = state.encryption;

  return Object.values(messageEncryptionStatusById).filter(
    (messageEntry) =>
      messageEntry.keyFingerprint &&
      Object.values(messageEntry.keyFingerprint).includes(fingerprint)
  );
};

const setPassphrase =
  ({ fingerprint }) =>
  (dispatch, getState) => {
    const messages = findMessagesEncryptedWithKey(getState(), fingerprint).map(
      (message) => message.encryptedMessage
    );

    dispatch(decryptMessages({ messages }));
    // discard passphrase after 20 minutes
    setTimeout(() => dispatch(resetPassphrase({ fingerprint })), 12000000);
  };

export default (store) => (next) => (action) => {
  switch (action.type) {
    // FIXME: this does not exist anymore, is it syncDraft now? (but it is a draftFormData now)
    // What is the algo: fetch draft > decrypt draft > store draft form data > edit draft > encrypt draft > save ?
    // case DRAFT_REQUEST_DRAFT_SUCCESS:
    //   store
    //     .dispatch(
    //       decryptMessage({ message: extractMessagesFromAction(action)[0] })
    //     )
    //     .then((draft) =>
    //       store.dispatch(
    //         decryptDraftSuccess({
    //           internalId: action.payload.internalId,
    //           draft,
    //         })
    //       )
    //     );

    //   return next(action);
    case MESSAGE_REQUEST_DRAFT_SUCCESS:
    case REQUEST_MESSAGE_SUCCESS:
    case REQUEST_MESSAGES_SUCCESS:
    case FETCH_MESSAGES_SUCCESS:
      store.dispatch(
        decryptMessages({ messages: extractMessagesFromAction(action) })
      );

      return next(action);
    case SET_PASSPHRASE:
      next(action);

      return store.dispatch(
        setPassphraseSuccess({ fingerprint: action.payload.fingerprint })
      );
    case SET_PASSPHRASE_SUCCESS:
      store.dispatch(
        setPassphrase({ fingerprint: action.payload.fingerprint })
      );

      return next(action);
    default:
      break;
  }

  return next(action);
};
