import { createSelector } from 'reselect';
import { getModuleStateSelector } from '../../../store/selectors/getModuleStateSelector';

export const contactSelector = (state, { contactId }) =>
  getModuleStateSelector('contact')(state).contactsById[contactId];

export const contactsSelector = createSelector(
  getModuleStateSelector('contact'),
  ({ contacts, contactsById }) =>
    contacts.map((contactId) => contactsById[contactId])
);
