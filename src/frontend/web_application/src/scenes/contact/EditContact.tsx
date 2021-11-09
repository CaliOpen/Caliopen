import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { contactSelector } from 'src/modules/contact';
import { requestContact } from 'src/modules/contact/store';
import { ContactCommon } from 'src/modules/contact/types';
import { RootState } from 'src/store/reducer';
import ContactPageWrapper from './components/ContactPageWrapper';

function EditContact(): React.ReactElement<typeof ContactPageWrapper> {
  const dispatch = useDispatch();
  const { contactId } = useParams<{ contactId: string }>();
  const contact = useSelector<RootState, undefined | ContactCommon>((state) =>
    contactSelector(state, contactId)
  );

  React.useEffect(() => {
    dispatch(requestContact(contactId));
  }, [contactId]);

  if (!contact) {
    return <>TODO</>;
  }

  return (
    <ContactPageWrapper contact={contact} contactId={contactId} isEditing>
      <EditContact
      // form={form}
      // contact={contact}
      // valid={valid}
      // submitting={submitting}
      // isSaving={isSaving}
      />
    </ContactPageWrapper>
  );
}

export default EditContact;
