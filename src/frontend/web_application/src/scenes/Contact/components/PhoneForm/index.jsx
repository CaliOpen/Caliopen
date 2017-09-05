import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { withTranslator } from '@gandi/react-translate';
import renderReduxField from '../../services/renderReduxField';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';
import { FieldErrors, Fieldset, Legend, TextFieldGroup as TextFieldGroupBase, SelectFieldGroup as SelectFieldGroupBase, FormGrid, FormRow, FormColumn } from '../../../../components/form';
import './style.scss';

const PHONE_TYPES = ['work', 'home', 'other'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

@withTranslator()
class PhoneForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: [],
  };

  componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    const { __ } = this.props;
    this.addressTypes = {
      work: __('contact.phone_type.work'),
      home: __('contact.phone_type.home'),
      other: __('contact.phone_type.other'),
    };
  }

  render() {
    const { __, errors, onDelete } = this.props;
    const typeOptions = PHONE_TYPES.map(value => ({
      value,
      label: this.addressTypes[value],
    }));

    return (
      <FormGrid className="m-phone-form">
        <Fieldset>
          <FormRow>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
            <FormColumn size="shrink">
              <Legend>
                <Icon rightSpaced type="phone" />
                <span className="m-phone-form__legend">{__('contact.phone_form.legend')}</span>
              </Legend>
            </FormColumn>
            <FormColumn size="shrink" bottomSpace>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={__('contact.phone_form.type.label')}
                showLabelforSr
                options={typeOptions}
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={TextFieldGroup}
                name="number"
                type="tel"
                label={__('contact.phone_form.number.label')}
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
