import { PagerParams, AxiosActionPayload, ResourceStatus } from 'src/types';
import calcObjectForPatch from 'src/services/api-patch';
import { ContactPayload } from '../types';

export const REQUEST_CONTACTS = 'co/contact/REQUEST_CONTACTS';
export const REQUEST_CONTACTS_SUCCESS = 'co/contact/REQUEST_CONTACTS_SUCCESS';
export const REQUEST_CONTACTS_FAIL = 'co/contact/REQUEST_CONTACTS_FAIL';
export const INVALIDATE_CONTACTS = 'co/contact/INVALIDATE_CONTACTS';
export const LOAD_MORE_CONTACTS = 'co/contact/LOAD_MORE_CONTACTS';
export const REQUEST_CONTACT = 'co/contact/REQUEST_CONTACT';
export const REQUEST_CONTACT_SUCCESS = 'co/contact/REQUEST_CONTACT_SUCCESS';
export const UPDATE_CONTACT = 'co/contact/UPDATE_CONTACT';
export const UPDATE_CONTACT_SUCCESS = 'co/contact/UPDATE_CONTACT_SUCCESS';
export const UPDATE_CONTACT_FAIL = 'co/contact/UPDATE_CONTACT_FAIL';
export const CREATE_CONTACT = 'co/contact/CREATE_CONTACT';
export const CREATE_CONTACT_SUCCESS = 'co/contact/CREATE_CONTACT_SUCCESS';
export const CREATE_CONTACT_FAIL = 'co/contact/CREATE_CONTACT_FAIL';
export const DELETE_CONTACT = 'co/contact/DELETE_CONTACT';
export const UPDATE_TAGS = 'co/contact/UPDATE_TAGS';
export const UPDATE_TAGS_SUCCESS = 'co/contact/UPDATE_TAGS_SUCCESS';
export const UPDATE_TAGS_FAIL = 'co/contact/UPDATE_TAGS_FAIL';
export const REMOVE_MULTIPLE_FROM_COLLECTION =
  'co/contact/REMOVE_MULTIPLE_FROM_COLLECTION';
export const REQUEST_CONTACT_IDS_FOR_URI =
  'co/contact/REQUEST_CONTACT_IDS_FOR_URI';

// Actions --------------------------------------
// TODO: type axios middleware success/fail actions and extends it

interface RequestContactsAction {
  type: typeof REQUEST_CONTACTS;
  payload: AxiosActionPayload<PagerParams>;
}

interface RequestContactsSuccessAction {
  type: typeof REQUEST_CONTACTS_SUCCESS;
  payload: {
    data: {
      contacts: ContactPayload[];
      total: number;
    };
  };
}
interface RequestContactsFailAction {
  type: typeof REQUEST_CONTACTS_FAIL;
  error: any;
}

interface RequestContactAction {
  type: typeof REQUEST_CONTACT;
  payload: AxiosActionPayload<undefined>;
}

interface RequestContactSuccessAction {
  type: typeof REQUEST_CONTACT_SUCCESS;
  payload: {
    data: ContactPayload;
  };
}

interface RemoveMultipleFromCollectionAction {
  type: typeof REMOVE_MULTIPLE_FROM_COLLECTION;
  payload: {
    contacts: ContactPayload[];
  };
}

interface InvalidateAction {
  type: typeof INVALIDATE_CONTACTS;
  payload: {};
}

type ContactAction =
  | RequestContactsAction
  | RequestContactsSuccessAction
  | RequestContactsFailAction
  | RequestContactAction
  | RequestContactSuccessAction
  | RemoveMultipleFromCollectionAction
  | InvalidateAction;
//  ---------------------------------------------

// State ----------------------------------------
interface ContactState {
  initialized: boolean;
  status: ResourceStatus;
  // @deprected: use status instead
  isFetching: boolean;
  didInvalidate: boolean;
  // ---
  contactsById: {
    [id: string]: ContactPayload;
  };
  contacts: string[];
  total: number;
}
// ----------------------------------------------

const PROTOCOL_PREFIXES = {
  email: 'email',
  twitter: 'twitter',
  mastodon: 'mastodon',
};

type RequestContactParams = PagerParams;
export function requestContacts(
  params: RequestContactParams = {}
): RequestContactsAction {
  const { offset = 0, limit = 1000 } = params;

  return {
    type: REQUEST_CONTACTS,
    payload: {
      request: {
        url: '/api/v2/contacts',
        params: { offset, limit },
      },
    },
  };
}

export function requestContact(contactId: string): RequestContactAction {
  return {
    type: REQUEST_CONTACT,
    payload: {
      request: {
        url: `/api/v2/contacts/${contactId}`,
      },
    },
  };
}

export function deleteContact({ contactId }) {
  return {
    type: DELETE_CONTACT,
    payload: {
      request: {
        method: 'delete',
        url: `/api/v2/contacts/${contactId}`,
      },
    },
  };
}

export function invalidate() {
  return {
    type: INVALIDATE_CONTACTS,
    payload: {},
  };
}

export function updateContact({ contact, original }) {
  const data = calcObjectForPatch(contact, original);

  return {
    type: UPDATE_CONTACT,
    payload: {
      request: {
        method: 'patch',
        url: `/api/v2/contacts/${contact.contact_id}`,
        data,
      },
    },
  };
}

export function createContact({ contact }) {
  return {
    type: CREATE_CONTACT,
    payload: {
      request: {
        method: 'post',
        url: '/api/v2/contacts',
        data: contact,
      },
    },
  };
}

export function updateTags({ contact, tags }) {
  const data = {
    tags,
    current_state: { tags: contact.tags },
  };

  return {
    type: UPDATE_TAGS,
    payload: {
      request: {
        method: 'patch',
        url: `/api/v2/contacts/${contact.contact_id}/tags`,
        data,
      },
    },
  };
}

export function removeMultipleFromCollection({ contacts }) {
  return {
    type: REMOVE_MULTIPLE_FROM_COLLECTION,
    payload: {
      contacts,
    },
  };
}

export function requestContactIdsForURI({ protocol, address }) {
  const protocolPrefix = PROTOCOL_PREFIXES[protocol];

  return {
    type: REQUEST_CONTACT_IDS_FOR_URI,
    payload: {
      request: {
        method: 'get',
        url: `/api/v2/contacts?uri=${protocolPrefix}:${address}`,
      },
    },
  };
}

type ContactsByReducerAction =
  | RequestContactsSuccessAction
  | RequestContactSuccessAction
  | RemoveMultipleFromCollectionAction;

function contactsByIdReducer(state = {}, action: ContactsByReducerAction) {
  switch (action.type) {
    case REQUEST_CONTACTS_SUCCESS:
      return action.payload.data.contacts.reduce(
        (previousState, contact) => ({
          ...previousState,
          [contact.contact_id]: contact,
        }),
        state
      );
    case REQUEST_CONTACT_SUCCESS:
      return {
        ...state,
        [action.payload.data.contact_id]: action.payload.data,
      };
    case REMOVE_MULTIPLE_FROM_COLLECTION:
      return action.payload.contacts.reduce(
        (prevState, contact) => ({
          ...prevState,
          [contact.contact_id]: undefined,
        }),
        state
      );
    default:
      return state;
  }
}

const filterContactIds = (
  contactsIds: string[],
  contacts: ContactPayload[]
) => {
  const contactIdsToRemove = contacts.map((contact) => contact.contact_id);

  return contactsIds.filter(
    (contactId) => !contactIdsToRemove.includes(contactId)
  );
};

type ContactListReducerAction =
  | RequestContactsSuccessAction
  | RemoveMultipleFromCollectionAction;
function contactListReducer(
  state: string[] = [],
  action: ContactListReducerAction
) {
  switch (action.type) {
    case REQUEST_CONTACTS_SUCCESS:
      return [...state]
        .concat(
          action.payload.data.contacts.map((contact) => contact.contact_id)
        )
        .reduce((prev: string[], curr: string) => {
          if (prev.indexOf(curr) === -1) {
            prev.push(curr);
          }

          return prev;
        }, []);
    case REMOVE_MULTIPLE_FROM_COLLECTION:
      return filterContactIds(state, action.payload.contacts);
    default:
      return state;
  }
}

export function getNextOffset(state: ContactState) {
  return state.contacts.length;
}

export function hasMore(state: ContactState) {
  return state.total > state.contacts.length;
}

const initialState: ContactState = {
  initialized: false,
  status: 'idle',
  isFetching: false,
  didInvalidate: false,
  contactsById: {},
  contacts: [],
  total: 0,
};

export function reducer(
  state: ContactState = initialState,
  action: ContactAction
): ContactState {
  switch (action.type) {
    case REQUEST_CONTACTS:
      return { ...state, status: 'pending', isFetching: true };
    case REQUEST_CONTACTS_SUCCESS:
      return {
        ...state,
        initialized: true,
        status: 'resolved',
        isFetching: false,
        didInvalidate: false,
        contacts: contactListReducer(
          state.didInvalidate === true ? [] : state.contacts,
          action
        ),
        contactsById: contactsByIdReducer(
          state.didInvalidate === true ? {} : state.contactsById,
          action
        ),
        total: action.payload.data.total,
      };
    case REQUEST_CONTACTS_FAIL:
      return {
        ...state,
        status: 'rejected',
      };
    case INVALIDATE_CONTACTS:
      return { ...state, didInvalidate: true };
    case REQUEST_CONTACT:
      return {
        ...state,
        status: 'pending',
        isFetching: true,
      };
    case REQUEST_CONTACT_SUCCESS:
      return {
        ...state,
        status: 'resolved',
        isFetching: false,
        contactsById: contactsByIdReducer(state.contactsById, action),
      };
    case REMOVE_MULTIPLE_FROM_COLLECTION:
      return {
        ...state,
        status: 'invalidated',
        didInvalidate: true,
        contacts: contactListReducer(state.contacts, action),
        contactsById: contactsByIdReducer(state.contactsById, action),
        total: state.total - action.payload.contacts.length,
      };
    default:
      return state;
  }
}
