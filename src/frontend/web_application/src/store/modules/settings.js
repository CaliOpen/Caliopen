import calcObjectForPatch from '../../services/api-patch';

export const REQUEST_SETTINGS = 'co/settings/REQUEST_SETTINGS';
export const REQUEST_SETTINGS_SUCCESS = 'co/settings/REQUEST_SETTINGS_SUCCESS';
export const REQUEST_SETTINGS_FAIL = 'co/settings/REQUEST_SETTINGS_FAIL';
export const UPDATE_SETTINGS = 'co/settings/UPDATE_SETTINGS';

export function requestSettings() {
  return {
    type: REQUEST_SETTINGS,
    payload: {
      request: {
        url: '/api/v1/settings',
      },
    },
  };
}

export function updateSettings({ settings, original }) {
  const data = calcObjectForPatch(settings, original);

  return {
    type: UPDATE_SETTINGS,
    payload: {
      request: {
        method: 'patch',
        url: '/api/v1/settings',
        data,
      },
    },
  };
}

export const initialState = {
  isFetching: false,
  isInvalidated: true,
  settings: {},
  didLostAuth: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_SETTINGS:
      return { ...state, isFetching: true };
    case REQUEST_SETTINGS_FAIL:
      return {
        ...state,
        isFetching: false,
        didLostAuth: action.error.response.status === 401,
      };
    case REQUEST_SETTINGS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isInvalidated: false,
        settings: action.payload.data,
        didLostAuth: false,
      };
    default:
      return state;
  }
}
