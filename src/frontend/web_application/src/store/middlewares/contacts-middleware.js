import { push } from 'react-router-redux';
import fetchLocation from '../../services/api-location';
import { getNextOffset, requestContact, requestContacts, CREATE_CONTACT_SUCCESS, LOAD_MORE_CONTACTS, DELETE_CONTACT_SUCCESS, UPDATE_CONTACT_SUCCESS } from '../modules/contact';
import { removeTab } from '../modules/tab';


const createHandler = async ({ store, action }) => {
  if (action.type !== CREATE_CONTACT_SUCCESS) {
    return;
  }
  const { location } = action.payload.data;
  const { data: contact } = await fetchLocation(location);
  const contactId = contact.contact_id;
  const state = store.getState();
  const tab = state.tab.tabs
    .find(currentTab => currentTab.pathname === '/new-contact');

  await store.dispatch(push(`/contacts/${contactId}`));
  store.dispatch(removeTab(tab));
};

const updateHandler = ({ store, action }) => {
  if (action.type !== UPDATE_CONTACT_SUCCESS) {
    return;
  }

  const { meta: { previousAction: { payload: { contactId } } } } = action;
  store.dispatch(requestContact({ contactId }));
};

const deleteHandler = async ({ store, action }) => {
  if (action.type !== DELETE_CONTACT_SUCCESS) {
    return;
  }

  const { meta: { previousAction: { payload: { contactId } } } } = action;
  const state = store.getState();
  const tab = state.tab.tabs
    .find(currentTab => currentTab.pathname === `/contacts/${contactId}`);

  if (tab) {
    await store.dispatch(requestContacts());
    await store.dispatch(push('/contacts'));
    store.dispatch(removeTab(tab));
  }
};

const loadMoreHandler = ({ store, action }) => {
  if (action.type !== LOAD_MORE_CONTACTS) {
    return;
  }
  const offset = getNextOffset(store.getState().contacts);
  store.dispatch(requestContacts({ offset }));
};

export default store => next => (action) => {
  const result = next(action);

  createHandler({ store, action });
  updateHandler({ store, action });
  deleteHandler({ store, action });
  loadMoreHandler({ store, action });

  return result;
};
