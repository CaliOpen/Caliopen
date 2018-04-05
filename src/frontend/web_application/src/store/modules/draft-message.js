import { v4 as uuidv4 } from 'uuid';

export const REQUEST_DRAFT = 'co/draft-message/REQUEST_DRAFT';
export const REQUEST_DRAFT_SUCCESS = 'co/draft-message/REQUEST_DRAFT_SUCCESS';
export const REQUEST_NEW_DRAFT = 'co/draft-message/REQUEST_NEW_DRAFT';
export const REQUEST_NEW_DRAFT_SUCCESS = 'co/draft-message/REQUEST_NEW_DRAFT_SUCCESS';
export const SYNC_DRAFT = 'co/draft-message/SYNC_DRAFT';
export const EDIT_DRAFT = 'co/draft-message/EDIT_DRAFT';
export const SAVE_DRAFT = 'co/draft-message/SAVE_DRAFT';
export const SEND_DRAFT = 'co/draft-message/SEND_DRAFT';
export const CLEAR_DRAFT = 'co/draft-message/CLEAR_DRAFT';
export const SET_RECIPIENT_SEARCH_TERMS = 'co/draft-message/SET_RECIPIENT_SEARCH_TERMS';

export function editDraft({ internalId, draft, message }) {
  return {
    type: EDIT_DRAFT,
    payload: { internalId, draft, original: message },
  };
}

export function saveDraft({ internalId, draft, message }) {
  return {
    type: SAVE_DRAFT,
    payload: { internalId, draft, original: message },
  };
}

export function requestNewDraft({ internalId = uuidv4() }) {
  return {
    type: REQUEST_NEW_DRAFT,
    payload: { internalId },
  };
}

export function requestNewDraftSuccess({ internalId, draft }) {
  return {
    type: REQUEST_NEW_DRAFT_SUCCESS,
    payload: { internalId, draft },
  };
}

export function requestDraft({ internalId = uuidv4(), discussionId }) {
  return {
    type: REQUEST_DRAFT,
    payload: { internalId, discussionId },
  };
}

export function requestDraftSuccess({ internalId, draft }) {
  return {
    type: REQUEST_DRAFT_SUCCESS,
    payload: { internalId, draft },
  };
}

export function syncDraft({ internalId, draft }) {
  return {
    type: SYNC_DRAFT,
    payload: { internalId, draft },
  };
}

export function sendDraft({ internalId, draft, message }) {
  return {
    type: SEND_DRAFT,
    payload: { internalId, draft, original: message },
  };
}

export function clearDraft({ internalId }) {
  return {
    type: CLEAR_DRAFT,
    payload: { internalId },
  };
}

export function setRecipientSearchTerms({ internalId, searchTerms }) {
  return {
    type: SET_RECIPIENT_SEARCH_TERMS,
    payload: { internalId, searchTerms },
  };
}

function syncReadOnlyProps(state, draft) {
  const {
    excerpt,
    tags,
    attachments,
  } = draft;

  return {
    ...state,
    excerpt,
    tags,
    attachments,
  };
}

function draftReducer(state = {}, action) {
  switch (action.type) {
    case REQUEST_DRAFT_SUCCESS:
    case REQUEST_NEW_DRAFT_SUCCESS:
    case EDIT_DRAFT:
      return {
        ...state,
        ...action.payload.draft,
      };
    case SYNC_DRAFT:
      return {
        ...action.payload.draft,
        ...state,
        ...syncReadOnlyProps(state, action.payload.draft),
      };
    default:
      return state;
  }
}

function dratfsByInternalIdReducer(state, action) {
  switch (action.type) {
    case REQUEST_DRAFT_SUCCESS:
    case REQUEST_NEW_DRAFT_SUCCESS:
    case SYNC_DRAFT:
      return {
        ...state,
        [action.payload.internalId]:
          draftReducer(state[action.payload.internalId], action),
      };
    case EDIT_DRAFT:
      return {
        ...state,
        [action.payload.internalId]: draftReducer(state[action.payload.internalId], action),
      };
    case CLEAR_DRAFT:
      return {
        ...state,
        [action.payload.internalId]: undefined,
      };
    default:
      return state;
  }
}

const initialState = {
  isFetching: false,
  didInvalidate: false,
  draftsByInternalId: {},
  recipientSearchTermsByInternalId: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_DRAFT:
    case REQUEST_NEW_DRAFT:
      return {
        ...state,
        isFetching: true,
      };
    case REQUEST_DRAFT_SUCCESS:
    case REQUEST_NEW_DRAFT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        draftsByInternalId: dratfsByInternalIdReducer(state.draftsByInternalId, action),
      };
    case EDIT_DRAFT:
    case CLEAR_DRAFT:
    case SYNC_DRAFT:
      return {
        ...state,
        draftsByInternalId: dratfsByInternalIdReducer(state.draftsByInternalId, action),
      };
    case SET_RECIPIENT_SEARCH_TERMS: {
      return {
        ...state,
        recipientSearchTermsByInternalId: {
          ...state.recipientSearchTermsByInternalId,
          [action.payload.internalId]: action.payload.searchTerms,
        },
      };
    }
    default:
      return state;
  }
}
