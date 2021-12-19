import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { FieldArray, Form, Formik, FormikConfig } from 'formik';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Button,
  FormColumn,
  FormGrid,
  FormRow,
  TextItem,
  TextList,
  Title,
} from 'src/components';
import {
  contactSelector,
  updateContact,
  IDENTITY_TYPE_TWITTER,
} from 'src/modules/contact';
import { invalidate, requestContact } from 'src/modules/contact/store';
import { ContactCommon, ContactPayload } from 'src/modules/contact/types';
import { notifyError } from 'src/modules/userNotify';
import { RootState } from 'src/store/reducer';
import ContactPageWrapper from './components/ContactPageWrapper';
import ContactProfileForm from './components/ContactProfileForm';
import EmailForm from './components/EmailForm';
import ImForm from './components/ImForm';
import PhoneForm from './components/PhoneForm';
import AddressForm from './components/AddressForm';
import OrgaForm from './components/OrgaForm';
import AddFormFieldForm from './components/AddFormFieldForm';
import IdentityForm from './components/IdentityForm';

type Props = withI18nProps;

function EditContact({
  i18n,
}: Props): React.ReactElement<typeof ContactPageWrapper> {
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

  const handleSubmit: FormikConfig<ContactPayload>['onSubmit'] = async (
    values
  ) => {
    try {
      await dispatch(updateContact({ contact: values, original: contact }));
      dispatch(invalidate());
    } catch (err) {
      dispatch(
        notifyError({
          message: i18n._('contact.feedback.unable_to_save', undefined, {
            defaults: 'Unable to save the contact',
          }),
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
                <FieldArray
                  name="addresses"
                  render={({ remove }) => (
                    <TextList>
                      {values.addresses?.map((item, index) => (
                        <TextItem key={index} large>
                          <AddressForm
                            name={`addresses.${index}`}
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
                <Trans id="contact.organization">Organization</Trans>
              </Title>
              <FieldArray
                name="organizations"
                render={({ remove, push }) => (
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
                            <Button icon="plus" shape="plain" onClick={push}>
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
                render={({ remove, push }) => (
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
                                push({ type: IDENTITY_TYPE_TWITTER })
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
              {/* {this.renderEditBar()} */}
              {/* <div className="s-contact__edit-bar">
        <Button
          onClick={this.handleCancel}
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
          disabled={hasActivity || !valid}
        >
          <Trans id="contact.action.validate_edit">Validate</Trans>
        </Button>
      </div> */}
            </Form>
          )}
        </Formik>
      </div>
    </ContactPageWrapper>
  );
}

export default withI18n()(EditContact);
