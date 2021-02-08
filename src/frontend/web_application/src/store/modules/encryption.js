export const ASK_PASSPHRASE = 'co/encryption/ASK_PASSPHRASE';
export const SET_PASSPHRASE = 'co/encryption/SET_PASSPHRASE';
export const SET_PASSPHRASE_SUCCESS = 'co/encryption/SET_PASSPHRASE_SUCCESS';
export const RESET_PASSPHRASE = 'co/encryption/RESET_PASSPHRASE';
export const NEED_PASSPHRASE = 'co/encryption/NEED_PASSPHRASE';
export const NEED_PRIVATEKEY = 'co/encryption/NEED_PRIVATEKEY';
export const ENCRYPT_MESSAGE = 'co/encryption/ENCRYPT_MESSAGE';
export const ENCRYPT_MESSAGE_SUCCESS = 'co/encryption/ENCRYPT_MESSAGE_SUCCESS';
export const ENCRYPT_MESSAGE_FAIL = 'co/encryption/ENCRYPT_MESSAGE_FAIL';
export const DECRYPT_MESSAGE = 'co/encryption/DECRYPT_MESSAGE';
export const DECRYPT_MESSAGE_SUCCESS = 'co/encryption/DECRYPT_MESSAGE_SUCCESS';
export const DECRYPT_MESSAGE_FAIL = 'co/encryption/DECRYPT_MESSAGE_FAIL';
export const RESET_ENCRYPTION = 'co/encryption/RESET_ENCRYPTION';

export const STATUS_NEED_PASSPHRASE = 'need_passphrase';
export const STATUS_NEED_PRIVATEKEY = 'need_privatekey';
export const STATUS_ENCRYPTING = 'encrypting';
export const STATUS_ENCRYPTED = 'encrypted';
export const STATUS_DECRYPTING = 'decrypting';
export const STATUS_DECRYPTED = 'decrypted';
export const STATUS_ERROR = 'error';

export function askPassphrase({ fingerprint, error }) {
  return {
    type: ASK_PASSPHRASE,
    payload: {
      fingerprint,
      error,
    },
  };
}

export function setPassphrase({ fingerprint, passphrase }) {
  return {
    type: SET_PASSPHRASE,
    payload: {
      fingerprint,
      passphrase,
    },
  };
}

export function setPassphraseSuccess({ fingerprint }) {
  return {
    type: SET_PASSPHRASE_SUCCESS,
    payload: {
      fingerprint,
    },
  };
}

export function resetPassphrase({ fingerprint }) {
  return {
    type: RESET_PASSPHRASE,
    payload: {
      fingerprint,
    },
  };
}

export function needPassphrase({ message, fingerprints }) {
  return {
    type: NEED_PASSPHRASE,
    payload: {
      message,
      fingerprints,
    },
  };
}

export function needPrivateKey({ message }) {
  return {
    type: NEED_PRIVATEKEY,
    payload: {
      message,
    },
  };
}

export function encryptMessage({ message }) {
  return {
    type: ENCRYPT_MESSAGE,
    payload: { message },
  };
}

export function encryptMessageSuccess({ message, encryptedMessage }) {
  return {
    type: ENCRYPT_MESSAGE_SUCCESS,
    payload: { message, encryptedMessage },
  };
}

export function encryptMessageFail({ message, error }) {
  return {
    type: ENCRYPT_MESSAGE_FAIL,
    payload: {
      message,
      error,
    },
  };
}

export function decryptMessage({ message }) {
  return {
    type: DECRYPT_MESSAGE,
    payload: { message },
  };
}

export function decryptMessageSuccess({ message, decryptedMessage }) {
  return {
    type: DECRYPT_MESSAGE_SUCCESS,
    payload: { message, decryptedMessage },
  };
}

export function decryptMessageFail({ message, error }) {
  return {
    type: DECRYPT_MESSAGE_FAIL,
    payload: {
      message,
      error,
    },
  };
}

export function resetEncryption({ message }) {
  return {
    type: RESET_ENCRYPTION,
    payload: {
      message,
    },
  };
}

const initialState = {
  messageEncryptionStatusById: {},
  privateKeysByFingerprint: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ASK_PASSPHRASE:
      return {
        ...state,
        privateKeysByFingerprint: {
          ...state.privateKeysByFingerprint,
          [action.payload.fingerprint]: {
            status: 'ask',
            passphrase: undefined,
            error: action.payload.error,
          },
        },
      };
    case SET_PASSPHRASE:
      return {
        ...state,
        privateKeysByFingerprint: {
          ...state.privateKeysByFingerprint,
          [action.payload.fingerprint]: {
            status: 'ok',
            passphrase: action.payload.passphrase,
            error: undefined,
          },
        },
      };
    case RESET_PASSPHRASE:
      return {
        ...state,
        privateKeysByFingerprint: {
          ...state.privateKeysByFingerprint,
          [action.payload.fingerprint]: {
            status: 'ko',
            passphrase: undefined,
          },
        },
      };
    case NEED_PASSPHRASE:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            status: STATUS_NEED_PASSPHRASE,
            keyFingerprint: action.payload.fingerprints,
            decryptedMessage: null,
            encryptedMessage: action.payload.message,
          },
        },
      };
    case NEED_PRIVATEKEY:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            status: STATUS_NEED_PRIVATEKEY,
            decryptedMessage: null,
            encryptedMessage: action.payload.message,
          },
        },
      };
    case ENCRYPT_MESSAGE:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            status: STATUS_ENCRYPTING,
            encryptedMessage: null,
            decryptedMessage: action.payload.message,
          },
        },
      };
    case ENCRYPT_MESSAGE_SUCCESS:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            status: STATUS_ENCRYPTED,
            encryptedMessage: action.payload.encryptedMessage,
            decryptedMessage: action.payload.message,
          },
        },
      };
    case ENCRYPT_MESSAGE_FAIL:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            status: STATUS_ERROR,
            error: action.payload.error,
            encryptedMessage: null,
            decryptedMessage: action.payload.message,
          },
        },
      };
    case DECRYPT_MESSAGE:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            error: undefined,
            status: STATUS_DECRYPTING,
            encryptedMessage: action.payload.message,
            decryptedMessage: null,
          },
        },
      };
    case DECRYPT_MESSAGE_SUCCESS:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            error: undefined,
            status: STATUS_DECRYPTED,
            encryptedMessage: action.payload.message,
            decryptedMessage: action.payload.decryptedMessage,
          },
        },
      };
    case DECRYPT_MESSAGE_FAIL:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: {
            error: action.payload.error,
            status: STATUS_ERROR,
            encryptMessage: action.payload.message,
            decryptedMessage: null,
          },
        },
      };
    case RESET_ENCRYPTION:
      return {
        ...state,
        messageEncryptionStatusById: {
          ...state.messageEncryptionStatusById,
          [action.payload.message.message_id]: undefined,
        },
      };

    default:
      return state;
  }
}
