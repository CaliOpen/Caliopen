import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { contactStateSelector } from 'src/store/selectors/contact';
import { requestContacts } from 'src/store/modules/contact';
import { contactsSelector } from '../selectors/contactSelector';

export function useContacts() {
  const dispatch = useDispatch();

  const state = useSelector(contactStateSelector);
  const { isFetching, contacts: contactIds, didInvalidate } = state;
  const contacts = useSelector(contactsSelector);

  React.useEffect(() => {
    if (!isFetching && (contactIds.length === 0 || didInvalidate)) {
      dispatch(requestContacts());
    }
  }, []);

  return {
    isFetching,
    didInvalidate,
    contacts,
  };
}
