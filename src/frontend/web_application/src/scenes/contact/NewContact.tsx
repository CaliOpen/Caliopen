import * as React from 'react';
import { getNewContact } from 'src/services/contact';
import ContactPageWrapper from './components/ContactPageWrapper';
import EditContact from './EditContact';

function NewContact(): React.ReactElement<typeof ContactPageWrapper> {
  const contact = getNewContact();

  return (
    <ContactPageWrapper>
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

export default NewContact;
