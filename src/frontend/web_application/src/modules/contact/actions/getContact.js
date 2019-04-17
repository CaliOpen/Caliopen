import { requestContact } from '../../../store/modules/contact';
import { contactSelector } from '../selectors/contactSelector';

export const getContact = ({ contactId }) => async (dispatch, getState) => {
  const contact = contactSelector(getState(), { contactId });

  if (contact) {
    return contact;
  }

  await dispatch(requestContact(contactId));

  return contactSelector(getState(), { contactId });
};
