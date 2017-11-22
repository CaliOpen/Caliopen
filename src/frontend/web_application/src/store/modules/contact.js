import calcObjectForPatch from '../../services/api-patch';
// import getConf from '../../services/api-client';

export const REQUEST_CONTACTS = 'co/contact/REQUEST_CONTACTS';
export const REQUEST_CONTACTS_SUCCESS = 'co/contact/REQUEST_CONTACTS_SUCCESS';
export const REQUEST_CONTACTS_FAIL = 'co/contact/REQUEST_CONTACTS_FAIL';
export const INVALIDATE_CONTACTS = 'co/contact/INVALIDATE_CONTACTS';
export const LOAD_MORE_CONTACTS = 'co/contact/LOAD_MORE_CONTACTS';
export const REQUEST_CONTACT = 'co/contact/REQUEST_CONTACT';
export const REQUEST_CONTACT_SUCCESS = 'co/contact/REQUEST_CONTACT_SUCCESS';
export const REQUEST_CONTACT_FAIL = 'co/contact/REQUEST_CONTACT_FAIL';
export const UPDATE_CONTACT = 'co/contact/UPDATE_CONTACT';
export const UPDATE_CONTACT_SUCCESS = 'co/contact/UPDATE_CONTACT_SUCCESS';
export const UPDATE_CONTACT_FAIL = 'co/contact/UPDATE_CONTACT_FAIL';
export const CREATE_CONTACT = 'co/contact/CREATE_CONTACT';
export const CREATE_CONTACT_SUCCESS = 'co/contact/CREATE_CONTACT_SUCCESS';
export const CREATE_CONTACT_FAIL = 'co/contact/CREATE_CONTACT_FAIL';
export const DELETE_CONTACT = 'co/contact/DELETE_CONTACT';
export const DELETE_CONTACT_SUCCESS = 'co/contact/DELETE_CONTACT_SUCCESS';

export function requestContacts(params = {}) {
  const { offset = 0, limit = 1000 } = params;

  return {
    type: REQUEST_CONTACTS,
    payload: {
      request: {
        url: '/v1/contacts',
        params: { offset, limit },
      },
    },
  };
}

export function loadMoreContacts() {
  return {
    type: LOAD_MORE_CONTACTS,
    payload: {},
  };
}

export function requestContact({ contactId }) {
  return {
    type: REQUEST_CONTACT,
    payload: {
      request: {
        url: `/v1/contacts/${contactId}`,
      },
    },
  };
}

export function deleteContact({ contactId }) {
  return {
    type: DELETE_CONTACT,
    payload: {
      contactId,
      request: {
        method: 'delete',
        url: `/v1/contacts/${contactId}`,
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
  const contactId = contact.contact_id;

  return {
    type: UPDATE_CONTACT,
    payload: {
      contactId,
      request: {
        method: 'patch',
        url: `/v1/contacts/${contactId}`,
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
        url: '/v1/contacts',
        data: contact,
      },
    },
  };
}

function contactsByIdReducer(state = {}, action = {}) {
  switch (action.type) {
    case REQUEST_CONTACTS_SUCCESS:
      return action.payload.data.contacts.reduce((previousState, contact) => ({
        ...previousState,
        [contact.contact_id]: contact,
      }), state);
    case REQUEST_CONTACT_SUCCESS:
      return {
        ...state,
        [action.payload.data.contact_id]: action.payload.data,
      };
    default:
      return state;
  }
}

function contactListReducer(state = [], action = {}) {
  if (action.type !== REQUEST_CONTACTS_SUCCESS) {
    return state;
  }

  return [...state]
    .concat(action.payload.data.contacts.map(contact => contact.contact_id))
    .reduce((prev, curr) => {
      if (prev.indexOf(curr) === -1) {
        prev.push(curr);
      }

      return prev;
    }, []);
}

export function getNextOffset(state) {
  return state.contacts.length;
}

export function hasMore(state) {
  return state.total > state.contacts.length;
}

const initialState = {
  isFetching: false,
  didInvalidate: false,
  contactsById: {},
  contacts: [],
  total: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_CONTACTS:
      return { ...state, isFetching: true };
    case REQUEST_CONTACTS_SUCCESS:
      return {
        ...state,
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
    case INVALIDATE_CONTACTS:
      return {
        ...state,
        didInvalidate: true,
      };
    case REQUEST_CONTACT:
      return {
        ...state,
        isFetching: true,
      };
    case REQUEST_CONTACT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        contactsById: contactsByIdReducer(
          state.contactsById,
          action
        ),
      };
    case CREATE_CONTACT_SUCCESS:
      return {
        ...state,
        contactsById: contactsByIdReducer(
          state.contactsById,
          action
        ),
      };
    case DELETE_CONTACT_SUCCESS:
      return {
        ...state,
        didInvalidate: true,
      };
    default:
      return state;
  }
}
