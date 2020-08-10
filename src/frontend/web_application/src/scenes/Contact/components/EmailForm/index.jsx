import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Trans, withI18n } from '@lingui/react';
import renderReduxField from '../../../../services/renderReduxField';
import {
  Button,
  Icon,
  FieldErrors,
  TextFieldGroup as TextFieldGroupBase,
  SelectFieldGroup as SelectFieldGroupBase,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import './style.scss';

const EMAIL_TYPES = ['', 'work', 'home', 'other'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

@withI18n()
class EmailForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: [],
    onDelete: () => {
      // noop
    },
  };

  UNSAFE_componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    const { i18n } = this.props;
    this.addressTypes = {
      work: i18n._('contact.email_type.work', null, {
        defaults: 'Professional',
      }),
      home: i18n._('contact.email_type.home', null, { defaults: 'Personal' }),
      other: i18n._('contact.email_type.other', null, { defaults: 'Other' }),
    };
  }

  render() {
    const { i18n, errors = [], onDelete } = this.props;
    const addressTypeOptions = EMAIL_TYPES.map((value) => ({
      value,
      label: this.addressTypes[value] || '',
    }));

    return (
      <FormGrid className="m-email-form">
        <Fieldset>
          <FormRow>
            <FormColumn size="shrink">
              <Legend>
                <Icon type="envelope" rightSpaced />
                <span className="m-email-form__legend">
                  <Trans id="contact.email_form.legend">Email</Trans>
                </span>
              </Legend>
            </FormColumn>
            {errors.length > 0 && (
              <FormColumn>
                <FieldErrors errors={errors} />
              </FormColumn>
            )}
            <FormColumn size="shrink" bottomSpace>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={i18n._('contact.email_form.type.label', null, {
                  defaults: 'Type',
                })}
                showLabelforSr
                options={addressTypeOptions}
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={TextFieldGroup}
                name="address"
                type="email"
                label={i18n._('contact.email_form.address.label', null, {
                  defaults: 'Address',
                })}
                showLabelforSr
                required
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
}

export default EmailForm;
