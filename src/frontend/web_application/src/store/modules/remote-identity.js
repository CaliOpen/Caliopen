import calcObjectForPatch from '../../services/api-patch';

export const REQUEST_REMOTE_IDENTITIES =
  'co/remote-identity/REQUEST_REMOTE_IDENTITIES';
export const REQUEST_REMOTE_IDENTITIES_SUCCESS =
  'co/remote-identity/REQUEST_REMOTE_IDENTITIES_SUCCESS';
export const REQUEST_REMOTE_IDENTITY =
  'co/remote-identity/REQUEST_REMOTE_IDENTITY';
export const REQUEST_REMOTE_IDENTITY_SUCCESS =
  'co/remote-identity/REQUEST_REMOTE_IDENTITY_SUCCESS';
export const CREATE_REMOTE_IDENTITY =
  'co/remote-identity/CREATE_REMOTE_IDENTITY';
export const UPDATE_REMOTE_IDENTITY =
  'co/remote-identity/UPDATE_REMOTE_IDENTITY';
export const DELETE_REMOTE_IDENTITY =
  'co/remote-identity/DELETE_REMOTE_IDENTITY';
export const DELETE_REMOTE_IDENTITY_SUCCESS =
  'co/remote-identity/DELETE_REMOTE_IDENTITY_SUCCESS';
export const ADD_TO_COLLECTION = 'co/remote-identity/ADD_TO_COLLECTION';
export const REMOVE_FROM_COLLECTION =
  'co/remote-identity/REMOVE_FROM_COLLECTION';
export const INVALIDATE = 'co/remote-identity/INVALIDATE';

export function requestRemoteIdentities() {
  return {
    type: REQUEST_REMOTE_IDENTITIES,
    payload: {
      request: {
        url: '/api/v2/identities/remotes',
      },
    },
  };
}

export function requestRemoteIdentity({ identityId }) {
  return {
    type: REQUEST_REMOTE_IDENTITY,
    payload: {
      request: {
        url: `/api/v2/identities/remotes/${identityId}`,
      },
    },
  };
}

export function createRemoteIdentity({ remoteIdentity }) {
  return {
    type: CREATE_REMOTE_IDENTITY,
    payload: {
      request: {
        url: '/api/v2/identities/remotes',
        method: 'post',
        data: {
          ...remoteIdentity,
        },
      },
    },
  };
}

export function updateRemoteIdentity({ remoteIdentity, original }) {
  const data = calcObjectForPatch(remoteIdentity, original);

  return {
    type: UPDATE_REMOTE_IDENTITY,
    payload: {
      request: {
        url: `/api/v2/identities/remotes/${remoteIdentity.identity_id}`,
        method: 'patch',
        data,
      },
    },
  };
}

export function deleteRemoteIdentity({ remoteIdentity }) {
  return {
    type: DELETE_REMOTE_IDENTITY,
    payload: {
      request: {
        url: `/api/v2/identities/remotes/${remoteIdentity.identity_id}`,
        method: 'delete',
      },
    },
  };
}

export function addToCollection({ remoteIdentity }) {
  return {
    type: ADD_TO_COLLECTION,
    payload: { remoteIdentity },
  };
}

export function removeFromCollection({ remoteIdentity }) {
  return {
    type: REMOVE_FROM_COLLECTION,
    payload: { remoteIdentity },
  };
}

const initialState = {
  isFetching: false,
  didInvalidate: false,
  remoteIdentitiesById: {},
  remoteIdentities: [],
  total: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_REMOTE_IDENTITIES:
      return { ...state, isFetching: true };
    case REQUEST_REMOTE_IDENTITIES_SUCCESS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        remoteIdentitiesById: action.payload.data.remote_identities.reduce(
          (acc, remoteIdentity) => ({
            ...acc,
            [remoteIdentity.identity_id]: remoteIdentity,
          }),
          state.remoteIdentitiesById
        ),
        remoteIdentities:
          state.didInvalidate === true
            ? []
            : action.payload.data.remote_identities.map(
                (remoteIdentity) => remoteIdentity.identity_id
              ),
        total: action.payload.data.total,
      };
    case REQUEST_REMOTE_IDENTITY_SUCCESS:
      return {
        ...state,
        remoteIdentitiesById: {
          ...state.remoteIdentitiesById,
          [action.payload.data.identity_id]: action.payload.data,
        },
      };
    case ADD_TO_COLLECTION:
      return {
        ...state,
        remoteIdentities: [
          ...state.remoteIdentities,
          action.payload.remoteIdentity.identity_id,
        ],
        total: state.total + 1,
      };
    case REMOVE_FROM_COLLECTION:
      return {
        ...state,
        remoteIdentities: state.remoteIdentities.filter(
          (identityId) =>
            identityId !== action.payload.remoteIdentity.identity_id
        ),
        total: state.total - 1,
      };
    case INVALIDATE:
      return { ...state, didInvalidate: true };
    default:
      return state;
  }
}
