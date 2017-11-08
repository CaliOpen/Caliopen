export const REQUEST_TABS = 'co/tab/REQUEST_TABS';
export const ADD_TAB = 'co/tab/ADD_TAB';
export const REMOVE_TAB = 'co/tab/REMOVE_TAB';
export const UPDATE_TAB = 'co/tab/UPDATE_TAB';
export const SELECT_OR_ADD_TAB = 'co/tab/SELECT_OR_ADD_TAB';

export function requestTabs() {
  return {
    type: REQUEST_TABS,
    payload: {},
  };
}

export function addTab(tab) {
  return {
    type: ADD_TAB,
    payload: { tab },
  };
}

export function selectOrAdd({ pathname, search, hash }) {
  return {
    type: SELECT_OR_ADD_TAB,
    payload: { pathname, search, hash },
  };
}

export function updateTab({ tab, original }) {
  return {
    type: UPDATE_TAB,
    payload: { tab, original },
  };
}

export function removeTab(tab) {
  return {
    type: REMOVE_TAB,
    payload: { tab },
  };
}

function updateTabReducer(state = [], action) {
  const i = state.indexOf(action.payload.original);
  const nextState = [...state];
  nextState[i] = action.payload.tab;

  return nextState;
}

const initialState = {
  tabs: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_TAB:
      return {
        ...state,
        tabs: [...state.tabs, action.payload.tab],
      };
    case REMOVE_TAB:
      return {
        ...state,
        tabs: state.tabs.filter(tab => tab !== action.payload.tab),
      };
    case UPDATE_TAB:
      return {
        ...state,
        tabs: updateTabReducer(state.tabs, action),
      };
    default:
      return state;
  }
}
