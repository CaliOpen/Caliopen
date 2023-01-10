import { AxiosActionPayload, PagerParams, ResourceStatus } from 'src/types';
import { TagPayload } from '../types';
import calcObjectForPatch from '../../../services/api-patch';

export const REQUEST_TAGS = 'co/tag/REQUEST_TAGS';
export const REQUEST_TAGS_SUCCESS = 'co/tag/REQUEST_TAGS_SUCCESS';
export const REQUEST_TAGS_FAIL = 'co/tag/REQUEST_TAGS_FAIL';
export const INVALIDATE_TAGS = 'co/tag/INVALIDATE_TAGS';
export const CREATE_TAG = 'co/tag/CREATE_TAG';
export const CREATE_TAG_SUCCESS = 'co/tag/CREATE_TAG_SUCCESS';
export const REQUEST_TAG = 'co/tag/REQUEST_TAG';
export const UPDATE_TAG = 'co/tag/UPDATE_TAG';
export const REMOVE_TAG = 'co/tag/REMOVE_TAG';

// Actions --------------------------------------
// TODO: type axios middleware success/fail actions and extends it

interface RequestTagsAction {
  type: typeof REQUEST_TAGS;
  payload: AxiosActionPayload<PagerParams>;
}

interface RequestTagsSuccessAction {
  type: typeof REQUEST_TAGS_SUCCESS;
  payload: {
    data: {
      tags: TagPayload[];
      total: number;
    };
  };
}
interface RequestTagsFailAction {
  type: typeof REQUEST_TAGS_FAIL;
  error: any;
}
interface InvalidateAction {
  type: typeof INVALIDATE_TAGS;
  payload: Record<string, unknown>;
}

type TagAction =
  | RequestTagsAction
  | RequestTagsSuccessAction
  | RequestTagsFailAction
  | InvalidateAction;

// State ----------------------------------------
export interface TagState {
  initialized: boolean;
  status: ResourceStatus;
  tags: TagPayload[];
  total: number;
}
// ----------------------------------------------
/**
 * @deprecated
 */
export function updateTag({ tag, original }) {
  const data = calcObjectForPatch(tag, original);

  return {
    type: UPDATE_TAG,
    payload: {
      request: {
        method: 'patch',
        url: `/api/v2/tags/${original.name}`,
        data,
      },
    },
  };
}

// Reducer --------------------------------------
const initialState: TagState = {
  status: 'idle',
  initialized: false,
  tags: [],
  total: 0,
};

export function reducer(
  state: TagState = initialState,
  action: TagAction
): TagState {
  switch (action.type) {
    case REQUEST_TAGS:
      return { ...state, status: 'pending' };
    case REQUEST_TAGS_SUCCESS:
      return {
        ...state,
        initialized: true,
        status: 'resolved',
        tags: action.payload.data.tags,
        total: action.payload.data.total,
      };
    case REQUEST_TAGS_FAIL:
      return {
        ...state,
        status: 'rejected',
      };
    case INVALIDATE_TAGS:
      return { ...state, status: 'invalidated' };
    default:
      return state;
  }
}
