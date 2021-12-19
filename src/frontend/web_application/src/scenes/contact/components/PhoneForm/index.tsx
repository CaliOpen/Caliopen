import * as React from 'react';
import { Field } from 'formik';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { FormikTextFieldGroup } from 'src/components/TextFieldGroup';
import { FormikSelectFieldGroup } from 'src/components/SelectFieldGroup';
import {
  Icon,
  Button,
  FieldErrors,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import './style.scss';
import { ItemProps } from '../FormCollection';

const PHONE_TYPES = ['', 'work', 'home', 'other'];

function PhoneForm({ onDelete, i18n, name }: ItemProps & withI18nProps) {
  const addressTypes = {
    work: i18n._('contact.phone_type.work', undefined, {
      defaults: 'Professional',
    }),
    home: i18n._('contact.phone_type.home', undefined, {
      defaults: 'Personal',
    }),
    other: i18n._('contact.phone_type.other', undefined, { defaults: 'Other' }),
  };

  const typeOptions = PHONE_TYPES.map((value) => ({
    value,
    label: addressTypes[value] || '',
  }));

  return (
    <FormGrid className="m-phone-form">
      <Fieldset>
        <FormRow>
          {/* {errors.length > 0 && (
              <FormColumn>
                <FieldErrors errors={errors} />
              </FormColumn>
            )} */}
          <FormColumn size="shrink">
            <Legend>
              <Icon rightSpaced type="phone" />
              <span className="m-phone-form__legend">
                <Trans id="contact.phone_form.legend">Phone</Trans>
              </span>
            </Legend>
          </FormColumn>
          <FormColumn size="shrink" bottomSpace>
            <Field
              component={FormikSelectFieldGroup}
              name={`${name}.type`}
              label={i18n._('contact.phone_form.type.label', undefined, {
                defaults: 'Type',
              })}
              showLabelforSr
              options={typeOptions}
            />
          </FormColumn>
          <FormColumn size="medium" fluid bottomSpace>
            <Field
              id={`edit-contact_${name}.number`}
              component={FormikTextFieldGroup}
              name={`${name}.number`}
              type="tel"
              label={i18n._('contact.phone_form.number.label', undefined, {
                defaults: 'Number',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact.phone_form.number.placeholder',
                  undefined,
                  {
                    defaults: 'Number',
                  }
                ),
                expanded: true,
              }}
              showLabelforSr
              required
            />
          </FormColumn>
          <FormColumn className="m-phone-form__col-button">
            <Button icon="remove" color="alert" onClick={onDelete} />
          </FormColumn>
        </FormRow>
      </Fieldset>
    </FormGrid>
  );
}

export default withI18n()(PhoneForm);
