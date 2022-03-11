import { Trans } from '@lingui/react';
import { FieldArray, Form, Formik, FormikConfig } from 'formik';
import * as React from 'react';
import {
  Button,
  FormColumn,
  FormGrid,
  FormRow,
  Spinner,
  TextItem,
  TextList,
  Title,
} from 'src/components';
import { IDENTITY_TYPE_TWITTER } from 'src/modules/contact';
import { ContactPayload } from 'src/modules/contact/types';
import FormikPersist from 'src/modules/form/components/FormikPersist';
import ContactProfileForm from './components/ContactProfileForm';
import EmailForm from './components/EmailForm';
import ImForm from './components/ImForm';
import PhoneForm from './components/PhoneForm';
import AddressForm from './components/AddressForm';
import OrgaForm from './components/OrgaForm';
import AddFormFieldForm from './components/AddFormFieldForm';
import IdentityForm from './components/IdentityForm';

interface Props {
  initialValues: ContactPayload;
  handleSubmit: FormikConfig<ContactPayload>['onSubmit'];
  handleCancel: () => void;
  hasActivity: boolean;
  initialProfileSectionOpen?: boolean;
  formName: string;
}
function ContactForm({
  initialValues,
  handleSubmit,
  handleCancel,
  hasActivity,
  initialProfileSectionOpen,
  formName,
}: Props): JSX.Element {
  return (
    <div className="s-contact__form">
      <Formik<ContactPayload>
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values }) => (
          <Form method="post" name="edit-contact">
            <FormikPersist name={formName} />
            <Title hr>
              <Trans
                id="contact.edit_contact.title"
                message="Edit the contact"
              />
            </Title>
            <ContactProfileForm isNew={initialProfileSectionOpen} />
            <div>
              <Title hr>
                <Trans
                  id="contact.contact-details.title"
                  message="Contact details"
                />
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
              <Trans id="contact.addresses" message="Addresses" />
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
                            <Trans
                              id="contact.action.add-address"
                              message="Add an address"
                            />
                          </Button>
                        </FormColumn>
                      </FormRow>
                    </FormGrid>
                  </TextItem>
                </TextList>
              )}
            />
            <Title hr>
              <Trans id="contact.organization" message="Organization" />
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
                            <Trans
                              id="contact.action.add-organization"
                              message="Add an organization"
                            />
                          </Button>
                        </FormColumn>
                      </FormRow>
                    </FormGrid>
                  </TextItem>
                </TextList>
              )}
            />
            <Title hr>
              <Trans id="contact.identities" message="Identities" />
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
                            <Trans
                              id="contact.action.add-identity"
                              message="Add an identity"
                            />
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
                <Trans id="contact.action.cancel" message="Cancel" />
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
                <Trans id="contact.action.save" message="Save" />
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ContactForm;
