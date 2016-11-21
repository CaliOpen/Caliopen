export const REQUEST_USER = 'REQUEST_USER';
export const RECEIVE_USER = 'RECEIVE_USER';
export const INVALIDATE_USER = 'INVALIDATE_USER';

export function requestUser() {
  return {
    type: REQUEST_USER,
    payload: {},
  };
}

export function fetchUser() {
  return (dispatch) => {
    dispatch(this.requestUser());

    return this.UserRepository.getUser().then(user => dispatch(this.receiveUser(user)));
  };
}

export function receiveUser(user) {
  return {
    type: RECEIVE_USER,
    payload: { user },
  };
}

export function invalidate() {
  return {
    type: INVALIDATE_USER,
    payload: {},
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
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_USER:
      return { ...state, isFetching: true };
    case RECEIVE_USER:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        user: action.payload.user,
      };
    case INVALIDATE_USER:
      return { ...state, didInvalidate: true };
    default:
      return state;
  }
}
