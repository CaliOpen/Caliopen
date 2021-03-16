import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { shouldFetchSelector, stateSelector } from '../store/selectors';
import { requestContacts } from '../store/reducer';
import { contactsSelector } from '../selectors/contactSelector';

export function useContacts() {
  const dispatch = useDispatch();

  const { initialized, status } = useSelector(stateSelector);
  const shouldFetch = useSelector(shouldFetchSelector);
  const contacts = useSelector(contactsSelector);

  React.useEffect(() => {
    if (shouldFetch) {
      dispatch(requestContacts());
    }
  }, [shouldFetch]);

  return {
    initialized,
    status,
    contacts,
  };
}
