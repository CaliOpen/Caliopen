export const SEARCH = 'co/participant-suggestions/SEARCH';
export const SEARCH_SUCCESS = 'co/participant-suggestions/SEARCH_SUCCESS';
export const SUGGEST = 'co/participant-suggestions/SUGGEST';
export const SUGGEST_SUCCESS = 'co/participant-suggestions/SUGGEST_SUCCESS';

export function search(terms, context = 'msg_compose') {
  return {
    type: SEARCH,
    payload: {
      terms,
      context,
    },
  };
}

export function searchSuccess(terms, context, results) {
  return {
    type: SEARCH_SUCCESS,
    payload: {
      terms,
      context,
      results,
    },
  };
}

export function suggest(terms, context = 'msg_compose') {
  return {
    type: SUGGEST,
    payload: {
      request: {
        url: '/api/v2/participants/suggest',
        params: { q: terms, context },
      },
    },
  };
}

export const getKey = (terms, context = 'msg_compose') => `${context}_${terms}`;

const initialState = {
  isFetching: false,
  resultsByKey: {},
  searchTermsById: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH:
      return { ...state, isFetching: true };
    case SEARCH_SUCCESS:
      return {
        ...state,
        resultsByKey: {
          [getKey(action.payload.terms, action.payload.context)]: action.payload
            .results,
        },
      };
    default:
      return state;
  }
}
