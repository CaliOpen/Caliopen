export const SEARCH = 'co/search/SEARCH';
export const SEARCH_SUCCESS = 'co/search/SEARCH_SUCCESS';
export const LOAD_MORE = 'co/search/LOAD_MORE';

const RESULT_LIMIT = 20;

export function search({ term, doctype }, options = {}) {
  const limit = doctype ? RESULT_LIMIT : undefined;

  return {
    type: SEARCH,
    payload: {
      term,
      doctype,
      request: {
        url: '/api/v2/search',
        params: {
          term,
          doctype,
          limit,
          ...options,
        },
      },
    },
  };
}

export function loadMore({ term, doctype }) {
  return {
    type: LOAD_MORE,
    payload: {
      term,
      doctype,
    },
  };
}

const getHitKey = (doctype) => {
  switch (doctype) {
    case 'message':
      return 'messages_hits';
    case 'contact':
      return 'contact_hits';
    default:
      throw new Error(
        'doctype is unknown and must be one of "message" or "contact"'
      );
  }
};

export const getKey = (term, doctype = '') => `${doctype}_${term}`;
const getDoctypeResultHits = (term, doctype, state) => {
  const results = state.resultsByKey[getKey(term, doctype)];

  if (!results) {
    return false;
  }

  return results[getHitKey(doctype)];
};

export const hasMore = (term, doctype, state) => {
  const results = getDoctypeResultHits(term, doctype, state);

  if (!results) {
    return false;
  }

  const { total, [`${doctype}s`]: entities } = results;

  return total > entities.length;
};

export const getNextOffset = (term, doctype, state) => {
  const { [`${doctype}s`]: entities } = getDoctypeResultHits(
    term,
    doctype,
    state
  );

  return entities.length;
};

const initialState = {
  resultsByKey: {},
};

function hitUpdater(hit = {}, payload) {
  const { total, ...doctypes } = payload;

  return {
    ...hit,
    total,
    ...Object.keys(doctypes).reduce(
      (acc, doctype) => ({
        ...acc,
        [doctype]: [...(hit[doctype] ? hit[doctype] : []), ...payload[doctype]],
      }),
      {}
    ),
  };
}

function hitsUpdater(results = {}, payload) {
  const { total, ...hits } = payload;

  return {
    ...results,
    total,
    ...Object.keys(hits).reduce(
      (acc, hitName) => ({
        ...acc,
        [hitName]: hitUpdater(results[hitName], hits[hitName]),
      }),
      {}
    ),
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH:
      return { ...state, isFetching: true };
    case SEARCH_SUCCESS:
      return {
        ...state,
        resultsByKey: {
          ...state.resultsByKey,
          [getKey(
            action.meta.previousAction.payload.term,
            action.meta.previousAction.payload.doctype
          )]: action.meta.previousAction.payload.request.params.offset
            ? hitsUpdater(
                state.resultsByKey[
                  getKey(
                    action.meta.previousAction.payload.term,
                    action.meta.previousAction.payload.doctype
                  )
                ],
                action.payload.data
              )
            : action.payload.data,
        },
      };
    default:
      return state;
  }
}
