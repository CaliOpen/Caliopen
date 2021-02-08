import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Trans, withI18n } from '@lingui/react';
import renderReduxField from '../../../../services/renderReduxField';
import {
  Icon,
  Button,
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

const PHONE_TYPES = ['', 'work', 'home', 'other'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

@withI18n()
class PhoneForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {
    errors: [],
  };

  UNSAFE_componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    const { i18n } = this.props;
    this.addressTypes = {
      work: i18n._('contact.phone_type.work', null, {
        defaults: 'Professional',
      }),
      home: i18n._('contact.phone_type.home', null, { defaults: 'Personal' }),
      other: i18n._('contact.phone_type.other', null, { defaults: 'Other' }),
    };
  }

  render() {
    const { i18n, errors, onDelete } = this.props;
    const typeOptions = PHONE_TYPES.map((value) => ({
      value,
      label: this.addressTypes[value] || '',
    }));

    return (
      <FormGrid className="m-phone-form">
        <Fieldset>
          <FormRow>
            {errors.length > 0 && (
              <FormColumn>
                <FieldErrors errors={errors} />
              </FormColumn>
            )}
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
                component={SelectFieldGroup}
                name="type"
                label={i18n._('contact.phone_form.type.label', null, {
                  defaults: 'Type',
                })}
                showLabelforSr
                options={typeOptions}
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={TextFieldGroup}
                name="number"
                type="tel"
                label={i18n._('contact.phone_form.number.label', null, {
                  defaults: 'Number',
                })}
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
}

export default PhoneForm;
