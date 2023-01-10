import { Trans } from '@lingui/react';
import { FormikConfig } from 'formik';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { AxiosResponse } from 'axios';
import { Link, useHistory, useParams } from 'react-router-dom';
import { fromPairs } from 'lodash';
import { APIAxiosError } from 'src/services/api-client/types';
import {
  getContact,
  updateContact,
  getQueryKeys,
} from 'src/modules/contact/query';
import { getNewContact } from 'src/modules/contact';
import { Contact, ContactPayload } from 'src/modules/contact/types';
import { notifyError } from 'src/modules/userNotify';
import PageNotFound from 'src/scenes/error/PageNotFound';
import PageError from 'src/scenes/error/PageError';
import ContactPageWrapper from './components/ContactPageWrapper';
import ContactForm from './ContactForm';
import {
  ContactError,
  CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
  handleContactSaveErrors,
} from './services/handleContactSaveErrors';

const emptyContact = getNewContact();

function EditContact(): React.ReactElement<typeof ContactPageWrapper> {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const queryClient = useQueryClient();
  const { contactId } = useParams<{ contactId: string }>();
  const {
    data: contact,
    isFetching,
    isError,
    error,
  } = useQuery<AxiosResponse<Contact>, APIAxiosError, Contact>(
    getQueryKeys({ contactId }),
    () => getContact(contactId),
    {
      select: (response) => response.data,
    }
  );
  const { mutateAsync, isLoading: isUpdating } = useMutation<
    unknown,
    unknown,
    { value: ContactPayload; original: Contact }
  >(updateContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(getQueryKeys());
    },
  });

  const hasActivity = isFetching || isUpdating;

  const handleCancel = () => {
    push(`/contacts/${contactId}`);
  };

  // XXX: problem, API return status 500 instead of 404 in this case
  if (!contact && isError && error?.response?.status === 404) {
    return <PageNotFound />;
  }

  if (!contact && isError) {
    return <PageError />;
  }

  const handleSubmit: FormikConfig<ContactPayload>['onSubmit'] = async (
    value
  ) => {
    if (!contact) {
      return;
    }
    try {
      await mutateAsync({ value, original: contact });
      push(`/contacts/${contactId}`);
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
      // XXX: may be it would more efficient to use `useContacts`
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

  return (
    <ContactPageWrapper contact={contact} isEditing hasActivity={hasActivity}>
      <ContactForm
        initialValues={contact || emptyContact}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        hasActivity={hasActivity}
        formName={`edit-contact_${
          contact?.contact_id || emptyContact.contact_id || 'empty'
        }`}
      />
    </ContactPageWrapper>
  );
}
export default EditContact;
