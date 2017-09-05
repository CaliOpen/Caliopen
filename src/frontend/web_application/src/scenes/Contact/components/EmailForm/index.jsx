import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { withTranslator } from '@gandi/react-translate';
import renderReduxField from '../../services/renderReduxField';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';
import { FieldErrors, Fieldset, Legend, TextFieldGroup as TextFieldGroupBase, SelectFieldGroup as SelectFieldGroupBase, FormGrid, FormRow, FormColumn } from '../../../../components/form';
import './style.scss';

const EMAIL_TYPES = ['work', 'home', 'other'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);

@withTranslator()
class EmailForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func,
    __: PropTypes.func.isRequired,
  };

  static defaultProps = {
    errors: [],
    onDelete: () => {},
  };

  state = {
    contactDetail: {
      address: '',
      type: EMAIL_TYPES[0],
      is_primary: false,
    },
  };

  componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    const { __ } = this.props;
    this.addressTypes = {
      work: __('contact.email_type.work'),
      home: __('contact.email_type.home'),
      other: __('contact.email_type.other'),
    };
  }

  render() {
    const { __, errors = [], onDelete } = this.props;
    const addressTypeOptions = EMAIL_TYPES.map(value => ({
      value,
      label: this.addressTypes[value],
    }));

    return (
      <FormGrid className="m-email-form">
        <Fieldset>
          <FormRow>
            <FormColumn size="shrink">
              <Legend>
                <Icon type="envelope" rightSpaced />
                <span className="m-email-form__legend">{__('contact.email_form.legend')}</span>
              </Legend>
            </FormColumn>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
            <FormColumn size="shrink" bottomSpace>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={__('contact.email_form.type.label')}
                showLabelforSr
                options={addressTypeOptions}
              />
            </FormColumn>
            <FormColumn size="medium" fluid bottomSpace>
              <Field
                component={TextFieldGroup}
                name="address"
                type="email"
                label={__('contact.email_form.address.label')}
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
