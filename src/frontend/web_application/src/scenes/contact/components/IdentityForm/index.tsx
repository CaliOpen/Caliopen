import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import { Field } from 'formik';
import { FormikTextFieldGroup } from 'src/components/TextFieldGroup';
import { FormikSelectFieldGroup } from 'src/components/SelectFieldGroup';
import {
  IDENTITY_TYPE_TWITTER,
  IDENTITY_TYPE_MASTODON,
} from 'src/modules/contact';
import {
  Button,
  Icon,
  FieldErrors,
  SelectFieldGroup as SelectFieldGroupBase,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from 'src/components';

import './style.scss';
import { ItemProps } from '../FormCollection';

const IDENTITY_TYPES = [IDENTITY_TYPE_TWITTER, IDENTITY_TYPE_MASTODON];

function IdentityForm({ name, onDelete, i18n }: ItemProps & withI18nProps) {
  const identityTypeOptions = IDENTITY_TYPES.map((value) => ({
    value,
    label: value,
  }));

  return (
    <FormGrid className="m-identity-form">
      <Fieldset>
        <FormRow>
          {/* {errors.length > 0 && (
            <FormColumn>
              <FieldErrors errors={errors} />
            </FormColumn>
          )} */}
          <FormColumn size="shrink">
            <Legend>
              <Icon rightSpaced type="user" />
              <span className="m-identity-form__legend">
                <Trans id="contact.identity_form.legend">Identities</Trans>
              </span>
            </Legend>
          </FormColumn>
          <FormColumn size="shrink" bottomSpace>
            <Field
              component={FormikSelectFieldGroup}
              name={`${name}.type`}
              label={i18n._('contact.identity_form.service.label', undefined, {
                defaults: 'Service',
              })}
              options={identityTypeOptions}
              showLabelforSr
              required
            />
          </FormColumn>
          <FormColumn size="medium" fluid bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.name`}
              label={i18n._('contact.identity_form.identity.label', undefined, {
                defaults: 'Identity',
              })}
              showLabelforSr
              inputPropos={{
                placeholder: i18n._(
                  'contact.identity_form.identity.placeholder',
                  undefined,
                  { defaults: "username, account's URL..." }
                ),
                expanded: true,
              }}
              required
            />
          </FormColumn>
          <FormColumn className="m-identity-form__col-button">
            <Button color="alert" icon="remove" onClick={onDelete} />
          </FormColumn>
        </FormRow>
      </Fieldset>
    </FormGrid>
  );
}

export default withI18n()(IdentityForm);
