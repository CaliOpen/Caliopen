export * from './actions/deleteContacts';
export * from './actions/getContact';
export * from './actions/loadMoreContacts';
export * from './actions/updateContact';
export { default as WithContacts } from './components/WithContacts';
export { default as ContactList } from './components/ContactList';
export * as ContactListUtility from './components/ContactList';
export * from './hoc/withContacts';
export * from './selectors/contactSelector';
export * from './services/addAddressToContact';
export * from './services/identityTypes';
export * from './hooks/useContacts';
export * from './consts';
export * as store from './store';
// does not compile:
// export * from './types';
