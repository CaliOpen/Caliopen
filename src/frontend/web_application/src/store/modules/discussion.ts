import { Participant } from '../../modules/message/index';

interface Action {
  type: string;
  payload: any;
  meta?: any;
}
// import calcObjectForPatch from '../../services/api-patch';
export const REQUEST_DISCUSSIONS = 'co/discussion/REQUEST_DISCUSSIONS';
export const REQUEST_DISCUSSIONS_SUCCESS =
  'co/discussion/REQUEST_DISCUSSIONS_SUCCESS';
export const REQUEST_DISCUSSIONS_FAIL =
  'co/discussion/REQUEST_DISCUSSIONS_FAIL';
export const INVALIDATE_DISCUSSIONS = 'co/discussion/INVALIDATE_DISCUSSIONS';
export const REMOVE_DISCUSSION_FROM_COLLECTION =
  'co/discussion/REMOVE_DISCUSSION_FROM_COLLECTION';
export const LOAD_MORE_DISCUSSIONS = 'co/discussion/LOAD_MORE_DISCUSSIONS';
export const FILTER_IMPORTANCE = 'co/discussion/FILTER_IMPORTANCE';
export const REQUEST_DISCUSSION = 'co/discussion/REQUEST_DISCUSSION';
export const REQUEST_DISCUSSION_SUCCESS =
  'co/discussion/REQUEST_DISCUSSION_SUCCESS';
export const REQUEST_DISCUSSION_FAIL = 'co/discussion/REQUEST_DISCUSSION_FAIL';
export const REQUEST_DISCUSSION_BY_PARTICIPANTS =
  'co/discussion/REQUEST_DISCUSSION_BY_PARTICIPANTS';
export const REQUEST_DISCUSSION_BY_PARTICIPANTS_SUCCESS =
  'co/discussion/REQUEST_DISCUSSION_BY_PARTICIPANTS_SUCCESS';
export const REQUEST_DISCUSSION_BY_PARTICIPANTS_FAIL =
  'co/discussion/REQUEST_DISCUSSION_BY_PARTICIPANTS_FAIL';
export const UPDATE_DISCUSSION = 'co/discussion/UPDATE_DISCUSSION';
export const REMOVE_DISCUSSION = 'co/discussion/REMOVE_DISCUSSION';

export function requestDiscussions(
  params: { offset?: number; limit?: number } = {}
): Action {
  const { offset = 0, limit = 20 } = params;

  return {
    type: REQUEST_DISCUSSIONS,
    payload: {
      request: {
        url: '/api/v2/discussions',
        params: { offset, limit },
      },
    },
  };
}

export function loadMoreDiscussions(): Action {
  return {
    type: LOAD_MORE_DISCUSSIONS,
    payload: {},
  };
}

export function filterImportance({
  min,
  max,
}: {
  min: number;
  max: number;
}): Action {
  return {
    type: FILTER_IMPORTANCE,
    payload: { min, max },
  };
}

export function requestDiscussion({
  discussionId,
}: {
  discussionId: string;
}): Action {
  return {
    type: REQUEST_DISCUSSION,
    payload: {
      request: {
        url: `/api/v2/discussions/${discussionId}`,
      },
    },
  };
}

export function requestDiscussionByParticipants({
  internalHash,
  participants,
}: {
  internalHash: string;
  participants: Participant[];
}): Action {
  return {
    type: REQUEST_DISCUSSION_BY_PARTICIPANTS,
    payload: {
      internalHash,
      request: {
        method: 'post',
        url: '/api/v2/participants/discussion',
        data: participants,
      },
    },
  };
}

export function invalidate(): Action {
  return {
    type: INVALIDATE_DISCUSSIONS,
    payload: {},
  };
}
export function removeDiscussionFromCollection({
  discussionId,
}: {
  discussionId: string;
}): Action {
  return {
    type: REMOVE_DISCUSSION_FROM_COLLECTION,
    payload: {
      discussionId,
    },
  };
}

export function updateDiscussion(): void {
  const deprecated = new Error('updateDiscussion is deprecated');
  console.warn(deprecated);
}

function discussionsByIdReducer(state = {}, action: Action) {
  switch (action.type) {
    case REQUEST_DISCUSSIONS_SUCCESS:
      return action.payload.data.discussions.reduce(
        (previousState, discussion) => ({
          ...previousState,
          [discussion.discussion_id]: discussion,
        }),
        state
      );
    case REMOVE_DISCUSSION_FROM_COLLECTION:
      return {
        ...state,
        [action.payload.discussionId]: undefined,
      };
    default:
      return state;
  }
}

function discussionIdsReducer(state: string[] = [], action: Action) {
  switch (action.type) {
    case REQUEST_DISCUSSIONS_SUCCESS:
      return [...state]
        .concat(
          action.payload.data.discussions.map(
            (discussion) => discussion.discussion_id
          )
        )
        .reduce((prev: string[], curr) => {
          if (prev.indexOf(curr) === -1) {
            prev.push(curr);
          }

          return prev;
        }, []);
    case REMOVE_DISCUSSION_FROM_COLLECTION:
      return [...state].filter(
        (discussionId) => discussionId !== action.payload.discussionId
      );
    default:
      return state;
  }
}

interface HashState {
  discussionId?: string;
}

const hashInitialState: HashState = {
  discussionId: undefined,
};

function discussionByParticipantsHashReducer(state = hashInitialState, action) {
  switch (action.type) {
    case REQUEST_DISCUSSION_BY_PARTICIPANTS_SUCCESS:
      return {
        discussionId: action.payload.data.discussion_id,
      };
    case REQUEST_DISCUSSION_BY_PARTICIPANTS:
    default:
      return state;
  }
}

export interface Discussion {
  id: string;
}

export interface State {
  isFetching: boolean;
  didInvalidate: boolean;
  discussionsById: {
    [uuid: string]: Discussion;
  };
  discussions: Array<string>;
  discussionByParticipantsHash: {
    [hash: string]: HashState;
  };
  importanceRange: {
    min: number;
    max: number;
  };
  total: number;
}

export function getNextOffset(state: State): number {
  return state.discussions.length;
}

export function hasMore(state: State): boolean {
  return state.total > state.discussions.length;
}

const initialState: State = {
  isFetching: false,
  didInvalidate: false,
  discussionsById: {},
  discussions: [],
  discussionByParticipantsHash: {},
  importanceRange: {
    min: 0,
    max: 10,
  },
  total: 0,
};

export default function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case REQUEST_DISCUSSION:
    case REQUEST_DISCUSSIONS:
      return { ...state, isFetching: true };
    case REQUEST_DISCUSSION_FAIL:
    case REQUEST_DISCUSSIONS_FAIL:
      return { ...state, isFetching: false };
    case REQUEST_DISCUSSION_SUCCESS:
      return {
        ...state,
        isFetching: false,
        discussionsById: {
          ...state.discussionsById,
          [action.payload.data.discussion_id]: action.payload.data,
        },
      };
    case REQUEST_DISCUSSIONS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        discussions: discussionIdsReducer(
          state.didInvalidate === true ? [] : state.discussions,
          action
        ),
        discussionsById: discussionsByIdReducer(
          state.didInvalidate === true ? {} : state.discussionsById,
          action
        ),
        total: action.payload.data.total,
      };
    case INVALIDATE_DISCUSSIONS:
      return { ...state, didInvalidate: true };
    case REMOVE_DISCUSSION_FROM_COLLECTION:
      return {
        ...state,
        discussions: discussionIdsReducer(state.discussions, action),
        discussionsById: discussionsByIdReducer(state.discussionsById, action),
        total: state.total - 1,
      };
    case FILTER_IMPORTANCE:
      return {
        ...state,
        importanceRange: {
          min: action.payload.min,
          max: action.payload.max,
        },
      };
    case REQUEST_DISCUSSION_BY_PARTICIPANTS:
      return {
        ...state,
        discussionByParticipantsHash: {
          ...state.discussionByParticipantsHash,
          [action.payload.internalHash]: discussionByParticipantsHashReducer(
            state.discussionByParticipantsHash[action.payload.internalHash],
            action
          ),
        },
      };
    case REQUEST_DISCUSSION_BY_PARTICIPANTS_SUCCESS:
    case REQUEST_DISCUSSION_BY_PARTICIPANTS_FAIL:
      return {
        ...state,
        discussionByParticipantsHash: {
          ...state.discussionByParticipantsHash,
          [action.meta.previousAction.payload
            .internalHash]: discussionByParticipantsHashReducer(
            state.discussionByParticipantsHash[
              action.meta.previousAction.payload.internalHash
            ],
            action
          ),
        },
      };
    default:
      return state;
  }
}
