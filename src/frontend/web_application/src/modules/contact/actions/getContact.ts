import { requestContact } from '../store/reducer';
import { contactSelector } from '../selectors/contactSelector';
import { AppDispatch, GetState } from 'src/types';

export const getContact = ({ contactId }: { contactId: string }) => async (
  dispatch: AppDispatch,
  getState: GetState
) => {
  const contact = contactSelector(getState(), contactId);

  if (contact) {
    return contact;
  }

  await dispatch(requestContact(contactId));

  return contactSelector(getState(), contactId);
};
