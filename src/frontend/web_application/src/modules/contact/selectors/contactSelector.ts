import { createSelector } from 'reselect';
import { RootState } from 'src/store/reducer';
import { stateSelector } from '../store';
import { ContactPayload } from '../types';

export const contactSelector = (state: RootState, contactId: string) =>
  stateSelector(state).contactsById[contactId];

export const contactsSelector = createSelector<
  RootState,
  RootState['contact'],
  ContactPayload[]
>(stateSelector, ({ contacts, contactsById }) =>
  contacts.map((contactId) => contactsById[contactId])
);
