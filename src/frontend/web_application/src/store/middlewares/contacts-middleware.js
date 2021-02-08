import {
  getNextOffset,
  requestContacts,
  LOAD_MORE_CONTACTS,
} from '../modules/contact';

export default (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === LOAD_MORE_CONTACTS) {
    const offset = getNextOffset(store.getState().contacts);
    store.dispatch(requestContacts({ offset }));
  }

  return result;
};
