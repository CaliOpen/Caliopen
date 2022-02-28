import { Trans } from '@lingui/react';
import { FormikConfig } from 'formik';
import * as React from 'react';
import { useMutation, useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
  getConfigOne,
  getContact,
  updateContact,
} from 'src/modules/contact/query';
import { Contact, ContactPayload } from 'src/modules/contact/types';
import { notifyError } from 'src/modules/userNotify';
import ContactPageWrapper from './components/ContactPageWrapper';
import ContactForm from './ContactForm';
import {
  ContactError,
  CONTACT_ERROR_ADDRESS_UNICITY_CONSTRAINT,
  handleContactSaveErrors,
} from './services/handleContactSaveErrors';

function EditContact(): React.ReactElement<typeof ContactPageWrapper> {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { contactId } = useParams<{ contactId: string }>();
  const queryConfig = getConfigOne(contactId);
  const { data: contact, isFetching, isError } = useQuery(
    queryConfig.queryKey,
    () => getContact(contactId)
  );
  const { mutateAsync, isLoading: isUpdating } = useMutation<
    unknown,
    unknown,
    { value: ContactPayload; original: Contact }
  >(queryConfig.queryKey, updateContact);

  // TODO: posting / deleting
  const hasActivity = isFetching || isUpdating;

  const handleCancel = () => {
    push(`/contacts/${contactId}`);
  };

  if (!contact && isError) {
    return <>TODO ERROR</>;
  }

  if (!contact) {
    return <div>TODO</div>;
  }

  const handleSubmit: FormikConfig<ContactPayload>['onSubmit'] = async (
    value
  ) => {
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

  return (
    <ContactPageWrapper contact={contact} isEditing>
      <ContactForm
        initialValues={contact}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        hasActivity={hasActivity}
      />
    </ContactPageWrapper>
  );
}
export default EditContact;
