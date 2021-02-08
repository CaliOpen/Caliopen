import calcObjectForPatch from '../../services/api-patch';

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

const PROTOCOL_PREFIXES = {
  email: 'email',
  twitter: 'twitter',
  mastodon: 'mastodon',
};

export function requestContacts(params = {}) {
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

export function loadMoreContacts() {
  return {
    type: LOAD_MORE_CONTACTS,
    payload: {},
  };
}

export function requestContact(contactId) {
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

function contactsByIdReducer(state = {}, action = {}) {
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

const filterContactIds = ({ contactsIds, contacts }) => {
  const contactIdsToRemove = contacts.map((contact) => contact.contact_id);

  return contactsIds.filter(
    (contactId) => !contactIdsToRemove.includes(contactId)
  );
};

function contactListReducer(state = [], action = {}) {
  switch (action.type) {
    case REQUEST_CONTACTS_SUCCESS:
      return [...state]
        .concat(
          action.payload.data.contacts.map((contact) => contact.contact_id)
        )
        .reduce((prev, curr) => {
          if (prev.indexOf(curr) === -1) {
            prev.push(curr);
          }

          return prev;
        }, []);
    case REMOVE_MULTIPLE_FROM_COLLECTION:
      return filterContactIds({
        contactsIds: state,
        contacts: action.payload.contacts,
      });
    default:
      return state;
  }
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
      return { ...state, didInvalidate: true };
    case REQUEST_CONTACT:
      return {
        ...state,
        isFetching: true,
      };
    case REQUEST_CONTACT_SUCCESS:
      return {
        ...state,
        isFetching: false,
        contactsById: contactsByIdReducer(state.contactsById, action),
      };
    case REMOVE_MULTIPLE_FROM_COLLECTION:
      return {
        ...state,
        contacts: contactListReducer(state.contacts, action),
        contactsById: contactsByIdReducer(state.contactsById, action),
        total: state.total - action.payload.contacts.length,
      };
    default:
      return state;
  }
}
