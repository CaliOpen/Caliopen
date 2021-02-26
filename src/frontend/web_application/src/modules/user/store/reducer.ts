import { AxiosActionPayload, AxiosActionError } from 'src/types';
import calcObjectForPatch from 'src/services/api-patch';
import { UserPatchPayload, UserPayload } from '../types';
import {} from 'redux-axios-middleware';

export const REQUEST_USER = 'co/user/REQUEST_USER';
export const REQUEST_USER_SUCCESS = 'co/user/REQUEST_USER_SUCCESS';
export const REQUEST_USER_FAIL = 'co/user/REQUEST_USER_FAIL';
export const UPDATE_USER = 'co/user/UPDATE_USER';
export const INVALIDATE_USER = 'co/user/INVALIDATE_USER';

// Actions --------------------------------------

interface RequestUserAction {
  type: typeof REQUEST_USER;
  payload: AxiosActionPayload;
}
interface RequestUserSuccessAction {
  type: typeof REQUEST_USER_SUCCESS;
  payload: {
    data: UserPayload;
  };
}
interface RequestUserFailAction {
  type: typeof REQUEST_USER_FAIL;
  error: AxiosActionError;
}

interface InvalidateAction {
  type: typeof INVALIDATE_USER;
  payload: {};
}

interface UpdateUserAction {
  type: typeof UPDATE_USER;
  payload: AxiosActionPayload<undefined, UserPatchPayload>;
}

type UserAction =
  | RequestUserAction
  | RequestUserSuccessAction
  | RequestUserFailAction
  | InvalidateAction;
//  ---------------------------------------------

// State ----------------------------------------
interface UserState {
  isFetching: boolean;
  didInvalidate: boolean;
  didLostAuth: boolean;
  user: undefined | UserPayload;
}
// ----------------------------------------------

export function requestUser(): RequestUserAction {
  return {
    type: REQUEST_USER,
    payload: {
      request: {
        url: '/api/v1/me',
      },
    },
  };
}

export function invalidate(): InvalidateAction {
  return {
    type: INVALIDATE_USER,
    payload: {},
  };
}

export function updateUser(
  user: UserPayload,
  original: UserPayload
): UpdateUserAction {
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

// // XXX: unused?
// export function updateUserContact(contact) {
//   return (dispatch) => {
//     dispatch(this.ContactsActions.updateContact(contact));
//     dispatch(invalidate());
//   };
// }

const initialState: UserState = {
  isFetching: false,
  didInvalidate: false,
  didLostAuth: false,
  user: undefined,
};

export function reducer(
  state: UserState = initialState,
  action: UserAction
): UserState {
  switch (action.type) {
    case REQUEST_USER:
      return { ...state, isFetching: true };
    case REQUEST_USER_FAIL:
      return {
        ...state,
        isFetching: false,
        didLostAuth: action.error.response?.status === 401,
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
