export const ADD_VIEW = 'co/view/ADD_VIEW';

export function addView({ viewConfig }) {
  return {
    type: ADD_VIEW,
    payload: {
      viewConfig,
    },
  };
}

const initialViewState = {
  viewConfig: {},
  isFetching: false,
};

function viewReducer(state = initialViewState, action) {
  switch (action.type) {
    case ADD_VIEW:
      return {
        ...state,
        viewConfig: action.payload.viewConfig,
      };
    default:
      return state;
  }
}

function viewByIdReducer(state, action) {
  switch (action.type) {
    case ADD_VIEW:
      return {
        ...state,
        [action.payload.viewConfig.id]: viewReducer(
          state[action.payload.viewConfig.id],
          action
        ),
      };
    default:
      return state;
  }
}

const initialState = {
  viewById: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_VIEW:
      return {
        ...state,
        viewById: viewByIdReducer(state.viewById, action),
      };
    // FIXME: case FETCH
    default:
      return state;
  }
}
