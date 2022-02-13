import { createSelector } from 'reselect';
import { RootState } from 'src/store/reducer';
import { stateSelector } from '../store';
import { Contact } from '../types';

export const contactSelector = (state: RootState, contactId: string): Contact =>
  stateSelector(state).contactsById[contactId];

export const contactsSelector = createSelector<
  RootState,
  RootState['contact'],
  Contact[]
>(stateSelector, ({ contacts, contactsById }) =>
  contacts.map((contactId) => contactsById[contactId])
);
