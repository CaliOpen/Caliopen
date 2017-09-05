import calcObjectForPatch from '../../services/api-patch';

export const REQUEST_MESSAGES = 'co/message/REQUEST_MESSAGES';
export const REQUEST_MESSAGES_SUCCESS = 'co/message/REQUEST_MESSAGES_SUCCESS';
export const REQUEST_MESSAGES_FAIL = 'co/message/REQUEST_MESSAGES_FAIL';
export const INVALIDATE_MESSAGES = 'co/message/INVALIDATE_MESSAGES';
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


export function requestMessages({ offset = 0, limit = 20, discussionId }) {
  const params = { offset, limit, discussion_id: discussionId };

  return {
    type: REQUEST_MESSAGES,
    payload: {
      discussionId,
      request: {
        url: '/v2/messages',
        params,
      },
    },
  };
}

export function loadMoreMessages() {
  return {
    type: LOAD_MORE_MESSAGES,
    payload: {},
  };
}

export function invalidateDiscussion({ discussionId }) {
  return {
    type: INVALIDATE_MESSAGES,
    payload: {
      discussionId,
    },
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

export function getNextOffset(state) {
  return state.messages.length;
}

export function hasMore(state) {
  return state.total > state.messages.length;
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

function discussionInvalidateReducer(state, action) {
  switch (action.type) {
    case REQUEST_MESSAGES_SUCCESS:
      // we assume this results gives only messages from a discussion, cf. requestMessages
      return Object.keys(state).reduce((acc, discussionId) => {
        if (discussionId !== action.meta.previousAction.payload.discussionId) {
          return {
            ...acc,
            [discussionId]: state[discussionId],
          };
        }

        return acc;
      }, {});
    case INVALIDATE_MESSAGES:
      return {
        ...state,
        [action.payload.discussionId]: true,
      };
    default:
      return state;
  }
}

const removeDiscussionFromMessagesById = (messagesById, discussionId) => Object.keys(messagesById)
  .reduce((acc, messageId) => {
    if (messagesById[messageId].discussion_id === discussionId) {
      return acc;
    }

    return {
      ...acc,
      [messageId]: messagesById[messageId],
    };
  }, {});

const manageRequestMessagesSuccessReducer = (state, action) => {
  const { discussionId } = action.meta.previousAction.payload;
  const isInvalidated = state.didDiscussionInvalidate[discussionId] || false;

  const cleanedState = {
    ...state,
    messagesById: (isInvalidated ?
      removeDiscussionFromMessagesById(state.messagesById, discussionId) :
      state.messagesById),
  };

  return {
    ...cleanedState,
    isFetching: false,
    didDiscussionInvalidate: discussionInvalidateReducer(state.didDiscussionInvalidate, action),
    messagesById: messagesByIdReducer(cleanedState.messagesById, action),
    total: action.payload.data.total,
  };
};

const initialState = {
  isFetching: false,
  didDiscussionInvalidate: {},
  messagesById: {},
  total: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_MESSAGES:
    case CREATE_MESSAGE:
    case UPDATE_MESSAGE:
    case REQUEST_MESSAGE:
      return { ...state, isFetching: true };
    case REQUEST_MESSAGE_SUCCESS:
      return {
        ...state,
        isFetching: false,
        messagesById: messagesByIdReducer(
          state.messagesById,
          action
        ),
      };
    case REQUEST_MESSAGES_SUCCESS:
      return manageRequestMessagesSuccessReducer(state, action);
    case INVALIDATE_MESSAGES:
      return {
        ...state,
        didDiscussionInvalidate: discussionInvalidateReducer(state.didDiscussionInvalidate, action),
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
