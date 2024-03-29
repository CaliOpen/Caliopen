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
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from 'src/components';
import { validateRequired } from 'src/modules/form/services/validators';

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
          <FormColumn size="shrink">
            <Legend>
              <Icon rightSpaced type="user" />
              <span className="m-identity-form__legend">
                <Trans id="contact.identity_form.legend" message="Identities" />
              </span>
            </Legend>
          </FormColumn>
          <FormColumn size="shrink" bottomSpace>
            <Field
              component={FormikSelectFieldGroup}
              name={`${name}.type`}
              label={i18n._(
                /* i18n */ 'contact.identity_form.service.label',
                undefined,
                {
                  message: 'Service',
                }
              )}
              options={identityTypeOptions}
              showLabelforSr
              required
            />
          </FormColumn>
          <FormColumn size="medium" fluid bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.name`}
              validate={validateRequired(i18n)}
              label={i18n._(
                /* i18n */ 'contact.identity_form.identity.label',
                undefined,
                {
                  message: 'Identity',
                }
              )}
              showLabelforSr
              inputProps={{
                placeholder: i18n._(
                  /* i18n */ 'contact.identity_form.identity.placeholder',
                  undefined,
                  { message: "username, account's URL..." }
                ),
                expanded: true,
                required: true,
              }}
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
