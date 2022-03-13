export const SEARCH = 'co/participant-suggestions/SEARCH';
export const SEARCH_SUCCESS = 'co/participant-suggestions/SEARCH_SUCCESS';
export const SUGGEST = 'co/participant-suggestions/SUGGEST';
export const SUGGEST_SUCCESS = 'co/participant-suggestions/SUGGEST_SUCCESS';

export interface Action {
  type:
    | typeof SEARCH
    | typeof SEARCH_SUCCESS
    | typeof SUGGEST
    | typeof SUGGEST_SUCCESS;
  payload: any;
}
// XXX: declared by usage
export type Context = 'msg_compose';
// XXX: declared by usage
export type Protocol = 'email' | 'twitter' | 'mastodon';

export interface Suggestion {
  label: string;
  address: string;
  protocol: Protocol;
  contact_id?: string;
  source: 'contact' | 'participant';
}

export interface ContactSuggestionPayload {
  source: 'contact';
  contact_id: string;
  label: string;
}
export interface ParticipantSuggestionPayload {
  source: 'participant';
  address: string;
  label: string;
  protocol: Protocol;
}
export type SuggestionPayload =
  | ContactSuggestionPayload
  | ParticipantSuggestionPayload;

export function search(terms: string, context: Context = 'msg_compose') {
  return {
    type: SEARCH,
    payload: {
      terms,
      context,
    },
  };
}

export function searchSuccess(
  terms: string,
  context: Context,
  results: Suggestion[]
) {
  return {
    type: SEARCH_SUCCESS,
    payload: {
      terms,
      context,
      results,
    },
  };
}

export function suggest(terms: string, context: Context = 'msg_compose') {
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

export const getKey = (terms: string, context: Context = 'msg_compose') =>
  `${context}_${terms}`;

export interface State {
  isFetching: boolean;
  resultsByKey: {
    [key: string]: Suggestion[];
  };
}
const initialState: State = {
  isFetching: false,
  resultsByKey: {},
};

export default function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case SEARCH:
      return { ...state, isFetching: true };
    case SEARCH_SUCCESS:
      return {
        ...state,
        resultsByKey: {
          [getKey(action.payload.terms, action.payload.context)]:
            action.payload.results,
        },
      };
    default:
      return state;
  }
}
