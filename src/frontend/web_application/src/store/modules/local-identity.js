export const REQUEST_LOCAL_IDENTITIES =
  'co/local-identity/REQUEST_LOCAL_IDENTITIES';
export const REQUEST_LOCAL_IDENTITIES_SUCCESS =
  'co/local-identity/REQUEST_LOCAL_IDENTITIES_SUCCESS';
export const INVALIDATE = 'co/local-identity/INVALIDATE';

export function requestLocalIdentities() {
  return {
    type: REQUEST_LOCAL_IDENTITIES,
    payload: {
      request: {
        url: '/api/v2/identities/locals',
      },
    },
  };
}

// XXX: no id in api response
// function localIdentitiesByIdReducer(state, action) {
//   switch (action.type) {
//     case REQUEST_LOCAL_IDENTITIES_SUCCESS:
//       return action.payload.data.local_identities.reduce((previousState, localIdentity) => ({
//         ...previousState,
//         [localIdentity.id]: localIdentity,
//       }), state);
//     default:
//       return state;
//   }
// }

const initialState = {
  isFetching: false,
  didInvalidate: false,
  localIdentities: [],
  total: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_LOCAL_IDENTITIES:
      return { ...state, isFetching: true };
    case REQUEST_LOCAL_IDENTITIES_SUCCESS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        localIdentities:
          state.didInvalidate === true
            ? []
            : action.payload.data.local_identities,
        total: action.payload.data.total,
      };
    case INVALIDATE:
      return { ...state, didInvalidate: true };
    default:
      return state;
  }
}
