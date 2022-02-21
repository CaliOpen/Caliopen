import { Trans } from '@lingui/react';
import { FormikConfig } from 'formik';
import * as React from 'react';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import {
  createContact,
  getConfigNew,
  getContact,
  PostContactSuccess,
} from 'src/modules/contact/query';
import { ContactPayload } from 'src/modules/contact/types';
import { useCloseTab, useCurrentTab } from 'src/modules/tab';
import { notifyError } from 'src/modules/userNotify';
import { getNewContact } from 'src/services/contact';
import ContactPageWrapper from './components/ContactPageWrapper';
import ContactForm from './ContactForm';
import {
  ContactError,
  CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
  handleContactSaveErrors,
} from './services/handleContactSaveErrors';

function NewContact(): React.ReactElement<typeof ContactPageWrapper> {
  const dispatch = useDispatch();
  const closeTab = useCloseTab();
  const currentTab = useCurrentTab();

  const { push } = useHistory();
  const queryConfig = getConfigNew();

  const { mutateAsync, isLoading: isUpdating } = useMutation<
    PostContactSuccess,
    unknown,
    { value: ContactPayload }
  >(queryConfig.queryKey, createContact);
  const contact = getNewContact();
  const handleSubmit: FormikConfig<ContactPayload>['onSubmit'] = async (
    value
  ) => {
    try {
      const { contact_id: contactId } = await mutateAsync({ value });
      push(`/contacts/${contactId}`);
      closeTab(currentTab);
    } catch (err) {
      const contactErrors = handleContactSaveErrors(err);

      const contactIdsToGet = contactErrors
        ?.filter(
          (contactErr) =>
            contactErr.type === CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT
        )
        .map((contactErr: ContactError) => contactErr.ownerContactId);

      const contactsUsed = await Promise.all(
        contactIdsToGet?.map((ctId) => getContact(ctId)) || []
      );
      const contactsById = contactsUsed.reduce(
        (acc, curr) => ({ ...acc, [curr.contact_id]: curr }),
        {}
      );

      const message = contactErrors?.map((contactErr, index) => {
        switch (contactErr.type) {
          case CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT:
            // eslint-disable-next-line no-case-declarations
            const { address, ownerContactId } = contactErr as ContactError;

            return (
              <p key={`${contactErr.type}_${address}`}>
                <Trans
                  id="contact.feedback.unable_to_save_address_already_used"
                  defaults='The address "{address}" belongs to <0>{name}</0>. You can remove it from that contact before using it here.'
                  values={{
                    name:
                      (contactsById[ownerContactId] &&
                        contactsById[ownerContactId].given_name) ||
                      '?',
                    address,
                  }}
                  components={[<Link to={`/contacts/${ownerContactId}`} />]}
                />
              </p>
            );
          default:
            return (
              <p key={index}>
                <Trans id="contact.feedback.unable_to_save">
                  Unable to save the contact
                </Trans>
              </p>
            );
        }
      });

      dispatch(
        notifyError({
          duration: 0,
          message,
        })
      );
    }
  };

  const handleCancel = () => {
    closeTab();
  };

  return (
    <ContactPageWrapper isEditing>
      <ContactForm
        initialValues={contact}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        hasActivity={isUpdating}
      />
    </ContactPageWrapper>
  );
}

export default NewContact;
