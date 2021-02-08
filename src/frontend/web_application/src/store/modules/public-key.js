import { strToBase64 } from '../../services/encode-utils';

export const REQUEST_PUBLIC_KEYS = 'co/public-key/REQUEST_PUBLIC_KEYS';
export const REQUEST_PUBLIC_KEYS_SUCCESS =
  'co/public-key/REQUEST_PUBLIC_KEYS_SUCCESS';
export const REQUEST_PUBLIC_KEYS_FAIL =
  'co/public-key/REQUEST_PUBLIC_KEYS_FAIL';
export const CREATE_PUBLIC_KEY = 'co/public-key/CREATE_PUBLIC_KEYS';
export const CREATE_PUBLIC_KEY_SUCCESS =
  'co/public-key/CREATE_PUBLIC_KEYS_SUCCESS';
export const CREATE_PUBLIC_KEY_FAIL = 'co/public-key/CREATE_PUBLIC_KEYS_FAIL';
export const UPDATE_PUBLIC_KEY = 'co/public-key/UPDATE_PUBLIC_KEYS';
export const UPDATE_PUBLIC_KEY_SUCCESS =
  'co/public-key/UPDATE_PUBLIC_KEYS_SUCCESS';
export const UPDATE_PUBLIC_KEY_FAIL = 'co/public-key/UPDATE_PUBLIC_KEYS_FAIL';
export const DELETE_PUBLIC_KEY = 'co/public-key/DELETE_PUBLIC_KEYS';
export const DELETE_PUBLIC_KEY_SUCCESS =
  'co/public-key/DELETE_PUBLIC_KEYS_SUCCESS';
export const DELETE_PUBLIC_KEY_FAIL = 'co/public-key/DELETE_PUBLIC_KEYS_FAIL';

export function requestPublicKeys({ contactId }) {
  return {
    type: REQUEST_PUBLIC_KEYS,
    payload: {
      contactId,
      request: {
        url: `/api/v2/contacts/${contactId}/publickeys`,
      },
    },
  };
}

export function createPublicKey({ contactId, publicKey }) {
  const encodedKey = {
    ...publicKey,
    key: strToBase64(publicKey.key),
  };

  return {
    type: CREATE_PUBLIC_KEY,
    payload: {
      contactId,
      request: {
        method: 'post',
        url: `/api/v2/contacts/${contactId}/publickeys`,
        data: encodedKey,
      },
    },
  };
}

export function updatePublicKey({ contactId, publicKey, original }) {
  const { publicKeyId, label } = publicKey;
  const data = { label, current_state: original };

  return {
    type: UPDATE_PUBLIC_KEY,
    payload: {
      contactId,
      request: {
        method: 'patch',
        url: `/api/v2/contacts/${contactId}/publickeys/${publicKeyId}`,
        data,
      },
    },
  };
}

export function deletePublicKey({ contactId, publicKeyId }) {
  return {
    type: DELETE_PUBLIC_KEY,
    payload: {
      contactId,
      request: {
        method: 'delete',
        url: `/api/v2/contacts/${contactId}/publickeys/${publicKeyId}`,
      },
    },
  };
}

const initialState = {};

const extractContactIdFromAction = (action) =>
  action.meta.previousAction.payload.contactId;

const keyListReducer = (state = [], action = {}) => {
  const contactId = extractContactIdFromAction(action);

  return {
    ...state,
    [contactId]: {
      keys: action.payload.data.pubkeys,
      isFetching: false,
      total: action.payload.data.total,
      didInvalidate: false,
    },
  };
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_PUBLIC_KEY_SUCCESS:
    case UPDATE_PUBLIC_KEY_SUCCESS:
    case DELETE_PUBLIC_KEY_SUCCESS:
      return {
        ...state,
        [extractContactIdFromAction(action)]: {
          ...state[extractContactIdFromAction(action)],
          didInvalidate: true,
        },
      };
    case REQUEST_PUBLIC_KEYS:
      return {
        ...state,
        [action.payload.contactId]: {
          ...state[action.payload.contactId],
          isFetching: true,
        },
      };
    case REQUEST_PUBLIC_KEYS_SUCCESS:
      return keyListReducer(state, action);
    default:
      return state;
  }
}
