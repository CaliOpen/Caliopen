import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { Field } from 'formik';
import { FormikTextFieldGroup } from 'src/components/TextFieldGroup';
import { FormikSelectFieldGroup } from 'src/components/SelectFieldGroup';
import {
  Button,
  Icon,
  FieldErrors,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import { ItemProps } from '../FormCollection';

import './style.scss';

const IM_TYPES = ['', 'work', 'home', 'other', 'netmeeting'];

function ImForm({ i18n, name, onDelete }: ItemProps & withI18nProps) {
  const addressTypes = {
    work: i18n._('contact.im_type.work', undefined, {
      defaults: 'Professional',
    }),
    home: i18n._('contact.im_type.home', undefined, { defaults: 'Personal' }),
    other: i18n._('contact.im_type.other', undefined, { defaults: 'Other' }),
    netmeeting: i18n._('contact.im_type.netmeeting', undefined, {
      defaults: 'Netmeeting',
    }),
  };

  const addressTypeOptions = IM_TYPES.map((value) => ({
    value,
    label: addressTypes[value] || '',
  }));

  return (
    <FormGrid className="m-im-form">
      <Fieldset>
        <FormRow>
          <FormColumn size="shrink">
            <Legend>
              <Icon type="comment" rightSpaced />
              <span className="m-im-form__legend">
                <Trans id="contact.im_form.legend">Instant messaging</Trans>
              </span>
            </Legend>
          </FormColumn>
          {/* {errors.length > 0 && (
                <FormColumn>
                  <FieldErrors errors={errors} />
                </FormColumn>
              )} */}
          <FormColumn size="shrink" bottomSpace>
            <Field
              component={FormikSelectFieldGroup}
              name={`${name}.type`}
              label={i18n._('contact.im_form.type.label', undefined, {
                defaults: 'Type',
              })}
              showLabelforSr
              options={addressTypeOptions}
            />
          </FormColumn>

          <FormColumn size="medium" fluid bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.address`}
              label={i18n._('contact.im_form.address.label', undefined, {
                defaults: 'Address',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact.im_form.address.placeholder',
                  undefined,
                  {
                    defaults: 'Address',
                  }
                ),
                expanded: true,
              }}
              showLabelforSr
              required
            />
          </FormColumn>
          <FormColumn className="m-im-form__col-button">
            <Button color="alert" icon="remove" onClick={onDelete} />
          </FormColumn>
        </FormRow>
      </Fieldset>
    </FormGrid>
  );
}

export default withI18n()(ImForm);
