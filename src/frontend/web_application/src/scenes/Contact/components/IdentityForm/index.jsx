import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { Field } from 'redux-form';
import renderReduxField from '../../../../services/renderReduxField';
import {
  IDENTITY_TYPE_TWITTER,
  IDENTITY_TYPE_MASTODON,
} from '../../../../modules/contact';
import {
  Button,
  Icon,
  FieldErrors,
  SelectFieldGroup as SelectFieldGroupBase,
  TextFieldGroup as TextFieldGroupBase,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';

import './style.scss';

const IDENTITY_TYPES = [IDENTITY_TYPE_TWITTER, IDENTITY_TYPE_MASTODON];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

@withI18n()
class IdentityForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: [],
  };

  render() {
    const { i18n, onDelete, errors } = this.props;
    const identityTypeOptions = IDENTITY_TYPES.map((value) => ({
      value,
      label: value,
    }));

    return (
      <FormGrid className="m-identity-form">
        <Fieldset>
          <FormRow>
            {errors.length > 0 && (
              <FormColumn>
                <FieldErrors errors={errors} />
              </FormColumn>
            )}
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
                component={SelectFieldGroup}
                name="type"
                label={i18n._('contact.identity_form.service.label', null, {
                  defaults: 'Service',
                })}
                options={identityTypeOptions}
                showLabelforSr
                required
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={TextFieldGroup}
                name="name"
                label={i18n._('contact.identity_form.identity.label', null, {
                  defaults: 'Identity',
                })}
                showLabelforSr
                placeholder={i18n._(
                  'contact.identity_form.identity.placeholder',
                  null,
                  { defaults: "username, account's URL..." }
                )}
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
}

export default IdentityForm;
