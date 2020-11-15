import { IDraftMessageFormData } from 'src/modules/draftMessage/types';

export const CREATE_DRAFT = 'co/draft-message/CREATE_DRAFT';
export const SYNC_DRAFT = 'co/draft-message/SYNC_DRAFT';
export const EDIT_DRAFT = 'co/draft-message/EDIT_DRAFT';
export const SAVE_DRAFT = 'co/draft-message/SAVE_DRAFT';
export const SEND_DRAFT = 'co/draft-message/SEND_DRAFT';
export const CLEAR_DRAFT = 'co/draft-message/CLEAR_DRAFT';
export const REQUEST_DRAFT = 'co/draft-message/REQUEST_DRAFT';
export const REQUEST_DRAFT_SUCCESS = 'co/draft-message/REQUEST_DRAFT_SUCCESS';
export const DELETE_DRAFT = 'co/draft-message/DELETE_DRAFT';
export const DELETE_DRAFT_SUCCESS = 'co/draft-message/DELETE_DRAFT_SUCCESS';
export const SET_RECIPIENT_SEARCH_TERMS =
  'co/draft-message/SET_RECIPIENT_SEARCH_TERMS';
export const DECRYPT_DRAFT_SUCCESS = 'co/draft-message/DECRYPT_DRAFT_SUCCESS';

export function editDraft(draft: IDraftMessageFormData) {
  return {
    type: EDIT_DRAFT,
    payload: { draft },
  };
}

/**
 * @deprecated: not reduced nor axios action
 */
export function saveDraft({ draft }) {
  return {
    type: SAVE_DRAFT,
    payload: { draft },
  };
}

export function createDraft({ draft }) {
  return {
    type: CREATE_DRAFT,
    payload: { draft },
  };
}

export function syncDraft(draft: IDraftMessageFormData) {
  return {
    type: SYNC_DRAFT,
    payload: { draft },
  };
}

// useful?
export function sendDraft({ draft }) {
  return {
    type: SEND_DRAFT,
    payload: { draft },
  };
}

export function clearDraft({ draft }) {
  return {
    type: CLEAR_DRAFT,
    payload: { draft },
  };
}

export function requestDraft({ messageId }) {
  return {
    type: REQUEST_DRAFT,
    payload: { messageId },
  };
}

// TODEL?
export function requestDraftSuccess({ draft }) {
  return {
    type: REQUEST_DRAFT_SUCCESS,
    payload: { draft },
  };
}

export function deleteDraft({ draft }) {
  return {
    type: DELETE_DRAFT,
    payload: { draft },
  };
}

export function deleteDraftSuccess({ draft }) {
  return {
    type: DELETE_DRAFT_SUCCESS,
    payload: { draft },
  };
}

export function setRecipientSearchTerms({ messageId, searchTerms }) {
  return {
    type: SET_RECIPIENT_SEARCH_TERMS,
    payload: { messageId, searchTerms },
  };
}

export function decryptDraftSuccess({ draft }) {
  return {
    type: DECRYPT_DRAFT_SUCCESS,
    payload: { draft },
  };
}

function deleteDraftFromState(state, id) {
  const nextState = { ...state };
  delete nextState[id];

  return nextState;
}

function draftReducer(state = {}, action) {
  switch (action.type) {
    case CREATE_DRAFT:
    case EDIT_DRAFT:
    case REQUEST_DRAFT_SUCCESS:
    case DECRYPT_DRAFT_SUCCESS:
      return {
        ...state,
        ...action.payload.draft,
      };
    case SYNC_DRAFT:
      return { ...action.payload.draft };
    default:
      return state;
  }
}

function dratfsByMessageIdReducer(state, action) {
  switch (action.type) {
    case CREATE_DRAFT:
    case SYNC_DRAFT:
    case EDIT_DRAFT:
    case REQUEST_DRAFT_SUCCESS:
    case DECRYPT_DRAFT_SUCCESS:
      return {
        ...state,
        [action.payload.draft.message_id]: draftReducer(
          state[action.payload.draft.message_id],
          action
        ),
      };
    case CLEAR_DRAFT:
      return deleteDraftFromState(state, action.payload.draft.message_id);
    default:
      return state;
  }
}

function draftActivityByMessageIdReducer(state, action) {
  switch (action.type) {
    case REQUEST_DRAFT:
      return {
        ...state,
        [action.payload.draft.message_id]: {
          ...state[action.payload.draft.message_id],
          isRequestingDraft: true,
        },
      };
    case REQUEST_DRAFT_SUCCESS:
      return {
        ...state,
        [action.payload.draft.message_id]: {
          ...state[action.payload.draft.message_id],
          isRequestingDraft: false,
        },
      };
    case DELETE_DRAFT:
      return {
        ...state,
        [action.payload.draft.message_id]: {
          ...state[action.payload.draft.message_id],
          isDeletingDraft: true,
        },
      };
    case DELETE_DRAFT_SUCCESS:
      return {
        ...state,
        [action.payload.draft.message_id]: {
          ...state[action.payload.draft.message_id],
          isDeletingDraft: false,
        },
      };
    default:
      return state;
  }
}

const initialState = {
  didInvalidate: false,
  draftsByMessageId: {},
  recipientSearchTermsByMessageId: {},
  draftActivityByMessageId: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_DRAFT:
      return {
        ...state,
        draftsByMessageId: dratfsByMessageIdReducer(
          state.draftsByMessageId,
          action
        ),
      };
    case EDIT_DRAFT:
    case CLEAR_DRAFT:
    case SYNC_DRAFT:
      return {
        ...state,
        draftsByMessageId: dratfsByMessageIdReducer(
          state.draftsByMessageId,
          action
        ),
      };
    case DELETE_DRAFT:
    case DELETE_DRAFT_SUCCESS:
    case REQUEST_DRAFT:
      return {
        ...state,
        draftActivityByMessageId: draftActivityByMessageIdReducer(
          state.draftActivityByMessageId,
          action
        ),
      };
    case DECRYPT_DRAFT_SUCCESS:
    case REQUEST_DRAFT_SUCCESS:
      return {
        ...state,
        draftActivityByMessageId: draftActivityByMessageIdReducer(
          state.draftActivityByMessageId,
          action
        ),
        draftsByMessageId: dratfsByMessageIdReducer(
          state.draftsByMessageId,
          action
        ),
      };
    case SET_RECIPIENT_SEARCH_TERMS: {
      return {
        ...state,
        recipientSearchTermsByMessageId: {
          ...state.recipientSearchTermsByMessageId,
          [action.payload.messageId]: action.payload.searchTerms,
        },
      };
    }
    default:
      return state;
  }
}
