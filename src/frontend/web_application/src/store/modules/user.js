import calcObjectForPatch from '../../services/api-patch';

export const REQUEST_USER = 'co/user/REQUEST_USER';
export const REQUEST_USER_SUCCESS = 'co/user/REQUEST_USER_SUCCESS';
export const REQUEST_USER_FAIL = 'co/user/REQUEST_USER_FAIL';
export const UPDATE_USER = 'co/user/UPDATE_USER';
export const INVALIDATE_USER = 'co/user/INVALIDATE_USER';

export function requestUser() {
  return {
    type: REQUEST_USER,
    payload: {
      request: {
        url: '/api/v1/me',
      },
    },
  };
}

export function invalidate() {
  return {
    type: INVALIDATE_USER,
    payload: {},
  };
}

export function updateUser({ user, original }) {
  const data = calcObjectForPatch(user, original);

  return {
    type: UPDATE_USER,
    payload: {
      request: {
        method: 'patch',
        url: `/api/v2/users/${user.user_id}`,
        data,
      },
    },
  };
}

export function updateUserContact(contact) {
  return (dispatch) => {
    dispatch(this.ContactsActions.updateContact(contact));
    dispatch(invalidate());
  };
}

const initialState = {
  isFetching: false,
  didInvalidate: false,
  didLostAuth: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_USER:
      return { ...state, isFetching: true };
    case REQUEST_USER_FAIL:
      return {
        ...state,
        isFetching: false,
        didLostAuth: action.error.response.status === 401,
      };
    case REQUEST_USER_SUCCESS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        user: action.payload.data,
        didLostAuth: false,
      };
    case INVALIDATE_USER:
      return { ...state, didInvalidate: true };
    default:
      return state;
  }
}
