export const SET_INITIALIZED = 'co/notification/SET_INITIALIZED';
export const UPDATE_ALL = 'co/notification/UPDATE_ALL';
export const REMOVE = 'co/notification/REMOVE';

export function setInitialized() {
  return {
    type: SET_INITIALIZED,
    payload: {},
  };
}

export function updateAll(notifications) {
  return {
    type: UPDATE_ALL,
    payload: {
      notifications,
    },
  };
}

export function remove(notifications) {
  return {
    type: REMOVE,
    payload: {
      notifications,
    },
  };
}

const removeNotificationsReducer = (state, action) => {
  if (action.type !== REMOVE) {
    return state;
  }

  const notifs = new Set(action.payload.notifications);

  return [...state.filter((notification) => !notifs.has(notification))];
};

const initialState = {
  // true if first notifications request has been done
  initialized: false,
  notifications: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_INITIALIZED:
      return state.initialized ? state : { ...state, initialized: true };
    case UPDATE_ALL:
      return {
        ...state,
        notifications: [...action.payload.notifications],
      };
    case REMOVE:
      return {
        ...state,
        notifications: removeNotificationsReducer(state.notifications, action),
      };
    default:
      return state;
  }
}
