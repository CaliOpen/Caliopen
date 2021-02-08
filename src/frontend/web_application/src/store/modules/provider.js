export const REQUEST_PROVIDERS = 'co/provider/REQUEST_PROVIDERS';
export const REQUEST_PROVIDERS_SUCCESS =
  'co/provider/REQUEST_PROVIDERS_SUCCESS';

export const providerStateSelector = (state) => state.provider;

export function requestProviders() {
  return {
    type: REQUEST_PROVIDERS,
    payload: {
      request: {
        url: '/api/v2/providers',
      },
    },
  };
}

const initialState = {
  isFetching: false,
  didInvalidate: false,
  providers: undefined,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_PROVIDERS:
      return { ...state, isFetching: true };
    case REQUEST_PROVIDERS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        providers: action.payload.data.providers,
      };
    default:
      return state;
  }
}
