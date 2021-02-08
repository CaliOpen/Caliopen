import {
  deleteContact as deleteContactBase,
  invalidate,
  removeMultipleFromCollection,
} from '../../../store/modules/contact';

export const deleteContacts = ({ contacts }) => async (dispatch) => {
  try {
    const results = await Promise.all(
      contacts.map((contact) =>
        dispatch(deleteContactBase({ contactId: contact.contact_id }))
      )
    );

    await dispatch(removeMultipleFromCollection({ contacts }));

    return results;
  } catch (err) {
    await dispatch(invalidate());

    return Promise.reject(err);
  }
};
