import {
  updateContact as updateContactBase,
  requestContact,
} from '../store/reducer';
import { requestUser } from 'src/modules/user/store/reducer';
import { userSelector } from '../../user';

export const updateContact = ({ contact, original }) => async (
  dispatch,
  getState
) => {
  await dispatch(updateContactBase({ contact, original }));
  const userContact = userSelector(getState()).contact;

  if (userContact.contact_id === contact.contact_id) {
    dispatch(requestUser());
  }

  return dispatch(requestContact(contact.contact_id));
};
