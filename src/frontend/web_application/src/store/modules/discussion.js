// import calcObjectForPatch from '../../services/api-patch';
export const REQUEST_DISCUSSIONS = 'co/discussion/REQUEST_DISCUSSIONS';
export const REQUEST_DISCUSSIONS_SUCCESS = 'co/discussion/REQUEST_DISCUSSIONS_SUCCESS';
export const REQUEST_DISCUSSIONS_FAIL = 'co/discussion/REQUEST_DISCUSSIONS_FAIL';
export const INVALIDATE_DISCUSSIONS = 'co/discussion/INVALIDATE_DISCUSSIONS';
export const REQUEST_DISCUSSION = 'co/discussion/REQUEST_DISCUSSION';
export const UPDATE_DISCUSSION = 'co/discussion/UPDATE_DISCUSSION';
export const REMOVE_DISCUSSION = 'co/discussion/REMOVE_DISCUSSION';

export function requestDiscussions() {
  return {
    type: REQUEST_DISCUSSIONS,
    payload: {
      request: {
        url: '/v1/discussions',
      },
    },
  };
}

export function requestDiscussion({ discussionId }) {
  return {
    type: REQUEST_DISCUSSION,
    payload: {
      request: {
        url: `/v1/discussions/${discussionId}`,
      },
    },
  };
}

export function invalidate() {
  return {
    type: INVALIDATE_DISCUSSIONS,
    payload: {},
  };
}

export function updateDiscussion({ discussion, original }) {
  console.log(discussion, original);
  // const data = calcObjectForPatch(discussion, original);
  //
  // return {
  //   type: UPDATE_DISCUSSION,
  //   payload: {
  //     request: {
  //       method: 'patch',
  //       url: `/v1/discussions/${discussion.thread_id}`,
  //       data,
  //     },
  //   },
  // };
}

const initialState = {
  isFetching: false,
  didInvalidate: false,
  discussions: [],
  total: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_DISCUSSIONS:
      return { ...state, isFetching: true };
    case REQUEST_DISCUSSIONS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        discussions: action.payload.data.discussions,
        total: action.payload.data.total,
      };
    case INVALIDATE_DISCUSSIONS:
      return { ...state, didInvalidate: true };
    default:
      return state;
  }
}
