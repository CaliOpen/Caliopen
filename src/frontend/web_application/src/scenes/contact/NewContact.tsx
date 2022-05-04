import { Trans } from '@lingui/react';
import { AxiosResponse } from 'axios';
import { FormikConfig } from 'formik';
import { fromPairs } from 'lodash';
import * as React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import {
  createContact,
  getQueryKeys,
  getContact,
  PostContactSuccess,
} from 'src/modules/contact/query';
import { ContactPayload } from 'src/modules/contact/types';
import { useCloseTab, useCurrentTab } from 'src/modules/tab';
import { notifyError } from 'src/modules/userNotify';
import { getNewContact } from 'src/modules/contact';
import ContactPageWrapper from './components/ContactPageWrapper';
import ContactForm from './ContactForm';
import {
  ContactError,
  CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
  handleContactSaveErrors,
} from './services/handleContactSaveErrors';

function NewContact(): React.ReactElement<typeof ContactPageWrapper> {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const closeTab = useCloseTab();
  const currentTab = useCurrentTab();

  const { push } = useHistory();

  const { mutateAsync, isLoading: isUpdating } = useMutation<
    AxiosResponse<PostContactSuccess>,
    unknown,
    { value: ContactPayload }
  >(createContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(getQueryKeys());
    },
  });
  const contact = getNewContact();
  const handleSubmit: FormikConfig<ContactPayload>['onSubmit'] = async (
    value
  ) => {
    try {
      const {
        data: { contact_id: contactId },
      } = await mutateAsync({ value });
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
      const contactsById = fromPairs(
        contactsUsed.map((response) => [
          response.data.contact_id,
          response.data,
        ])
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
                  message='The address "{address}" belongs to <0>{name}</0>. You can remove it from that contact before using it here.'
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
                <Trans
                  id="contact.feedback.unable_to_save"
                  message="Unable to save the contact"
                />
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
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        hasActivity={isUpdating}
        initialProfileSectionOpen
        formName="new-contact"
      />
    </ContactPageWrapper>
  );
}

export default NewContact;
