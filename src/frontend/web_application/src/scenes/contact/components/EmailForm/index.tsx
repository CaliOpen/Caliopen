import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { Field } from 'formik';
import { FormikTextFieldGroup } from 'src/components/TextFieldGroup';
import { FormikSelectFieldGroup } from 'src/components/SelectFieldGroup';
import {
  Button,
  Icon,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from 'src/components';
import { validateRequired } from 'src/modules/form/services/validators';
import './style.scss';
import { ItemProps } from '../FormCollection';

const EMAIL_TYPES = ['', 'work', 'home', 'other'];

function EmailForm({ onDelete, i18n, name }: ItemProps & withI18nProps) {
  const addressTypes = {
    work: i18n._('contact.email_type.work', undefined, {
      defaults: 'Professional',
    }),
    home: i18n._('contact.email_type.home', undefined, {
      defaults: 'Personal',
    }),
    other: i18n._('contact.email_type.other', undefined, { defaults: 'Other' }),
  };

  const addressTypeOptions = EMAIL_TYPES.map((value) => ({
    value,
    label: addressTypes[value] || '',
  }));

  return (
    <FormGrid className="m-email-form">
      <Fieldset>
        <FormRow>
          <FormColumn size="shrink">
            <Legend>
              <Icon type="envelope" />
              <span className="m-email-form__legend">
                <Trans id="contact.email_form.legend">Email</Trans>
              </span>
            </Legend>
          </FormColumn>
          <FormColumn size="shrink" bottomSpace>
            <Field
              component={FormikSelectFieldGroup}
              name={`${name}.type`}
              label={i18n._('contact.email_form.type.label', undefined, {
                defaults: 'Type',
              })}
              showLabelforSr
              options={addressTypeOptions}
            />
          </FormColumn>
          <FormColumn size="medium" fluid bottomSpace>
            <Field
              id={`edit-contact_${name}.address`}
              component={FormikTextFieldGroup}
              name={`${name}.address`}
              validate={validateRequired(i18n)}
              type="email"
              label={i18n._('contact.email_form.address.label', undefined, {
                defaults: 'Address',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact.email_form.address.placeholder',
                  undefined,
                  { defaults: 'Email' }
                ),
                expanded: true,
                required: true,
              }}
              showLabelforSr
            />
          </FormColumn>
          <FormColumn className="m-email-form__col-button">
            <Button icon="remove" color="alert" onClick={onDelete} />
          </FormColumn>
        </FormRow>
      </Fieldset>
    </FormGrid>
  );
}

export default withI18n()(EmailForm);
