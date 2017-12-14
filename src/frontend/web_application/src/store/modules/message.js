import calcObjectForPatch from '../../services/api-patch';

export const REQUEST_MESSAGES = 'co/message/REQUEST_MESSAGES';
export const REQUEST_MESSAGES_SUCCESS = 'co/message/REQUEST_MESSAGES_SUCCESS';
export const REQUEST_MESSAGES_FAIL = 'co/message/REQUEST_MESSAGES_FAIL';
export const INVALIDATE_MESSAGES = 'co/message/INVALIDATE_MESSAGES';
export const INVALIDATE_ALL_MESSAGES = 'co/message/INVALIDATE_ALL_MESSAGES';
export const LOAD_MORE_MESSAGES = 'co/message/LOAD_MORE_MESSAGES';
export const REQUEST_MESSAGE = 'co/message/REQUEST_MESSAGE';
export const REQUEST_MESSAGE_SUCCESS = 'co/message/REQUEST_MESSAGE_SUCCESS';
export const UPDATE_MESSAGE = 'co/message/UPDATE_MESSAGE';
export const UPDATE_MESSAGE_SUCCESS = 'co/message/UPDATE_MESSAGE_SUCCESS';
export const UPDATE_MESSAGE_FAIL = 'co/message/UPDATE_MESSAGE_FAIL';
export const DELETE_MESSAGE = 'co/message/DELETE_MESSAGE';
export const DELETE_MESSAGE_SUCCESS = 'co/message/DELETE_MESSAGE_SUCCESS';
export const CREATE_MESSAGE = 'co/message/CREATE_MESSAGE';
export const CREATE_MESSAGE_SUCCESS = 'co/message/CREATE_MESSAGE_SUCCESS';
export const SYNC_MESSAGE = 'co/message/SYNC_MESSAGE';
export const POST_ACTIONS = 'co/message/POST_ACTIONS';
export const POST_ACTIONS_SUCCESS = 'co/message/POST_ACTIONS_SUCCESS';
export const REPLY_TO_MESSAGE = 'co/message/REPLY_TO_MESSAGE';

export function requestMessages(type = 'timeline', key = '0', { offset = 0, limit = 20, ...opts } = {}) {
  const params = { offset, limit, ...opts };

  return {
    type: REQUEST_MESSAGES,
    payload: {
      type,
      key,
      request: {
        url: '/v2/messages',
        params,
      },
    },
  };
}

export function loadMore(type, key) {
  return {
    type: LOAD_MORE_MESSAGES,
    payload: { type, key },
  };
}

export function invalidate(type, key) {
  return {
    type: INVALIDATE_MESSAGES,
    payload: { type, key },
  };
}

export function invalidateAll() {
  return {
    type: INVALIDATE_ALL_MESSAGES,
    payload: { },
  };
}

export function createMessage({ message }) {
  return {
    type: CREATE_MESSAGE,
    payload: {
      request: {
        url: '/v1/messages',
        method: 'post',
        data: { ...message },
      },
    },
  };
}

export function requestMessage({ messageId }) {
  return {
    type: REQUEST_MESSAGE,
    payload: {
      request: {
        url: `/v2/messages/${messageId}`,
      },
    },
  };
}

export function updateMessage({ message, original }) {
  const data = calcObjectForPatch(message, original);

  return {
    type: UPDATE_MESSAGE,
    payload: {
      request: {
        method: 'patch',
        url: `/v1/messages/${message.message_id}`,
        data,
      },
    },
  };
}

export function deleteMessage({ message }) {
  return {
    type: DELETE_MESSAGE,
    payload: {
      message,
      discussionId: message.discussion_id,
      request: {
        method: 'delete',
        url: `/v1/messages/${message.message_id}`,
      },
    },
  };
}

export function syncMessage({ message }) {
  return {
    type: SYNC_MESSAGE,
    payload: { message },
  };
}

export function postActions({ message, actions }) {
  return {
    type: POST_ACTIONS,
    payload: {
      message,
      request: {
        method: 'post',
        url: `/v2/messages/${message.message_id}/actions`,
        data: {
          actions,
        },
      },
    },
  };
}

export function replyToMessage({ internalId, message }) {
  return {
    type: REPLY_TO_MESSAGE,
    payload: { internalId, message },
  };
}

export function getNextOffset(state) {
  return state.messages.length;
}

export function hasMore(state) {
  return state.total > state.messages.length;
}

/**
 * @deprecated use createMessageCollectionStateSelector() instead (cf. selectors)
 */
export function getMessagesFromCollection(type, key, { state }) {
  if (!state.messagesCollections[type] || !state.messagesCollections[type][key]) {
    return [];
  }

  return state.messagesCollections[type][key].messages.map(id => state.messagesById[id]);
}

function messagesByIdReducer(state = {}, action = {}) {
  switch (action.type) {
    case REQUEST_MESSAGE_SUCCESS:
      return {
        ...state,
        [action.payload.data.message_id]: action.payload.data,
      };
    case REQUEST_MESSAGES_SUCCESS:
      return action.payload.data.messages.reduce((previousState, message) => ({
        ...previousState,
        [message.message_id]: message,
      }), state);
    case SYNC_MESSAGE:
      return {
        ...state,
        [action.payload.message.message_id]: action.payload.message,
      };
    default:
      return state;
  }
}

const messagesCollectionReducer = (state = {
  isFetching: false,
  didInvalidate: false,
  messages: [],
  total: 0,
  request: {},
}, action) => {
  switch (action.type) {
    case REQUEST_MESSAGES:
      return {
        ...state,
        isFetching: true,
      };
    case REQUEST_MESSAGES_SUCCESS:
      // FIXME: uniqueness messageIds
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        messages: [
          ...new Set([
            ...((state.didInvalidate && []) || state.messages),
            ...action.payload.data.messages.map(message => message.message_id),
          ]),
        ],
        total: action.payload.data.total,
        request: action.meta.previousAction.payload.request,
      };
    case INVALIDATE_ALL_MESSAGES:
    case INVALIDATE_MESSAGES:
      return {
        ...state,
        didInvalidate: true,
      };
    default:
      return state;
  }
};

const getTypeAndKeyFromAction = (action) => {
  switch (action.type) {
    case REQUEST_MESSAGES:
    case INVALIDATE_MESSAGES:
      return { type: action.payload.type, key: action.payload.key };
    case REQUEST_MESSAGES_SUCCESS:
      return {
        type: action.meta.previousAction.payload.type,
        key: action.meta.previousAction.payload.key,
      };
    default:
      throw new Error('invalid action', action);
  }
};

const makeMessagesCollectionTypeReducer = (action) => {
  const { type, key } = getTypeAndKeyFromAction(action);

  return (state = {}, act) => ({
    ...state,
    [type]: {
      ...(state[type] || {}),
      [key]: messagesCollectionReducer(state[type] && state[type][key], act),
    },
  });
};

const allMessagesCollectionsReducer = (state, action) => Object.keys(state)
  .reduce((accType, type) => ({
    ...accType,
    [type]: Object.keys(state[type]).reduce((accKey, key) => ({
      ...accKey,
      [key]: messagesCollectionReducer(state[type][key], action),
    }), {}),
  }), {});

const initialState = {
  messagesById: {},
  messagesCollections: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_MESSAGE_SUCCESS:
      return {
        ...state,
        messagesById: messagesByIdReducer(
          state.messagesById,
          action
        ),
      };
    case REQUEST_MESSAGES:
      return {
        ...state,
        messagesCollections: makeMessagesCollectionTypeReducer(action)(
          state.messagesCollections, action
        ),
      };
    case REQUEST_MESSAGES_SUCCESS:
      return {
        ...state,
        messagesById: messagesByIdReducer(state.messagesById, action),
        messagesCollections: makeMessagesCollectionTypeReducer(action)(
          state.messagesCollections, action
        ),
      };
    case INVALIDATE_MESSAGES:
      return {
        ...state,
        messagesCollections: makeMessagesCollectionTypeReducer(action)(
          state.messagesCollections, action
        ),
      };
    case INVALIDATE_ALL_MESSAGES:
      return {
        ...state,
        messagesCollections: allMessagesCollectionsReducer(state.messagesCollections, action),
      };
    case SYNC_MESSAGE:
      return {
        ...state,
        messagesById: messagesByIdReducer(state.messagesById, action),
      };
    default:
      return state;
  }
}
