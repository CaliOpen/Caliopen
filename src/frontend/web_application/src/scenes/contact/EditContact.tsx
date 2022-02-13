import { AxiosError, AxiosResponse } from 'axios';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { ErrorMessage, FieldArray, Form, Formik, FormikConfig } from 'formik';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Button,
  FormColumn,
  FormGrid,
  FormRow,
  Link,
  Spinner,
  TextItem,
  TextList,
  Title,
} from 'src/components';
import { IDENTITY_TYPE_TWITTER } from 'src/modules/contact';
import {
  getConfigOne,
  getContact,
  updateContact,
} from 'src/modules/contact/query';
import { Contact, ContactPayload } from 'src/modules/contact/types';
import { notifyError } from 'src/modules/userNotify';
import ContactPageWrapper from './components/ContactPageWrapper';
import ContactProfileForm from './components/ContactProfileForm';
import EmailForm from './components/EmailForm';
import ImForm from './components/ImForm';
import PhoneForm from './components/PhoneForm';
import AddressForm from './components/AddressForm';
import OrgaForm from './components/OrgaForm';
import AddFormFieldForm from './components/AddFormFieldForm';
import IdentityForm from './components/IdentityForm';
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
    return <>TODO</>;
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
    <ContactPageWrapper contact={contact} contactId={contactId} isEditing>
      <div className="s-contact__form">
        <Formik<ContactPayload> initialValues={contact} onSubmit={handleSubmit}>
          {({ values }) => (
            <Form method="post" name="edit-contact">
              <Title hr>
                <Trans id="contact.edit_contact.title">Edit the contact</Trans>
              </Title>
              <ContactProfileForm />
              <div>
                <Title hr>
                  <Trans id="contact.contact-details.title">
                    Contact details
                  </Trans>
                </Title>
                <FieldArray
                  name="emails"
                  render={({ remove }) => (
                    <TextList>
                      {values.emails?.map((item, index) => (
                        <TextItem key={index} large>
                          <EmailForm
                            name={`emails.${index}`}
                            onDelete={() => remove(index)}
                          />
                        </TextItem>
                      ))}
                    </TextList>
                  )}
                />
                <FieldArray
                  name="phones"
                  render={({ remove }) => (
                    <TextList>
                      {values.phones?.map((item, index) => (
                        <TextItem key={index} large>
                          <PhoneForm
                            name={`phones.${index}`}
                            onDelete={() => remove(index)}
                          />
                        </TextItem>
                      ))}
                    </TextList>
                  )}
                />
                <FieldArray
                  name="ims"
                  render={({ remove }) => (
                    <TextList>
                      {values.ims?.map((item, index) => (
                        <TextItem key={index} large>
                          <ImForm
                            name={`ims.${index}`}
                            onDelete={() => remove(index)}
                          />
                        </TextItem>
                      ))}
                    </TextList>
                  )}
                />
                {/* {hasBirthday && (<BirthdayForm form={form} />)} */}
                <AddFormFieldForm />
              </div>
              <Title hr>
                <Trans id="contact.addresses">Addresses</Trans>
              </Title>
              <FieldArray
                name="addresses"
                render={({ remove, handlePush }) => (
                  <TextList>
                    {values.addresses?.map((item, index) => (
                      <TextItem key={index} large>
                        <AddressForm
                          name={`addresses.${index}`}
                          onDelete={() => remove(index)}
                        />
                      </TextItem>
                    ))}
                    <TextItem>
                      <FormGrid>
                        <FormRow>
                          <FormColumn>
                            <Button
                              icon="plus"
                              shape="plain"
                              onClick={handlePush({})}
                            >
                              <Trans id="contact.action.add-address">
                                Add an address
                              </Trans>
                            </Button>
                          </FormColumn>
                        </FormRow>
                      </FormGrid>
                    </TextItem>
                  </TextList>
                )}
              />
              <Title hr>
                <Trans id="contact.organization">Organization</Trans>
              </Title>
              <FieldArray
                name="organizations"
                render={({ remove, push: pushOrga }) => (
                  <TextList>
                    {values.organizations?.map((item, index) => (
                      <TextItem key={index}>
                        <OrgaForm
                          name={`organizations.${index}`}
                          onDelete={() => remove(index)}
                        />
                      </TextItem>
                    ))}
                    <TextItem>
                      <FormGrid>
                        <FormRow>
                          <FormColumn>
                            <Button
                              icon="plus"
                              shape="plain"
                              onClick={() => pushOrga({})}
                            >
                              <Trans id="contact.action.add-organization">
                                Add an organization
                              </Trans>
                            </Button>
                          </FormColumn>
                        </FormRow>
                      </FormGrid>
                    </TextItem>
                  </TextList>
                )}
              />
              <Title hr>
                <Trans id="contact.identities">Identities</Trans>
              </Title>
              <FieldArray
                name="identities"
                render={({ remove, push: pushIdentity }) => (
                  <TextList>
                    {values.identities?.map((item, index) => (
                      <TextItem key={index} large>
                        <IdentityForm
                          name={`identities.${index}`}
                          onDelete={() => remove(index)}
                        />
                      </TextItem>
                    ))}
                    <TextItem>
                      <FormGrid>
                        <FormRow>
                          <FormColumn>
                            <Button
                              icon="plus"
                              shape="plain"
                              onClick={() =>
                                pushIdentity({ type: IDENTITY_TYPE_TWITTER })
                              }
                            >
                              <Trans id="contact.action.add-identity">
                                Add an identity
                              </Trans>
                            </Button>
                          </FormColumn>
                        </FormRow>
                      </FormGrid>
                    </TextItem>
                  </TextList>
                )}
              />
              <div className="s-contact__edit-bar">
                <Button
                  onClick={handleCancel}
                  responsive="icon-only"
                  icon="remove"
                  className="s-contact__action"
                  shape="plain"
                  color="disabled"
                >
                  <Trans id="contact.action.cancel_edit">Cancel</Trans>
                </Button>
                <Button
                  type="submit"
                  responsive="icon-only"
                  icon={
                    hasActivity ? (
                      <Spinner
                        svgTitleId="validate-contact-spinner"
                        isLoading
                        display="inline"
                      />
                    ) : (
                      'check'
                    )
                  }
                  className="s-contact__action"
                  shape="plain"
                  disabled={hasActivity}
                >
                  <Trans id="contact.action.validate_edit">Validate</Trans>
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </ContactPageWrapper>
  );
}

export default EditContact;
