import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextList, { ItemContent } from '../../../../components/TextList';
import { SelectFieldGroup, FormGrid, FormRow, FormColumn, Legend } from '../../../../components/form';
import Button from '../../../../components/Button';
import Icon from '../../../../components/Icon';
import './style.scss';

class AddFormFieldForm extends Component {
  static propTypes = {
    form: PropTypes.string.isRequired,
    addFieldToCollection: PropTypes.func.isRequired,
    changeField: PropTypes.func.isRequired,
    // formValues: PropTypes.shape({}).isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
  };
  state = {
    formType: 'emails',
  };

  handleSelectChange = (ev) => {
    const { value } = ev.target;
    this.setState({
      formType: value,
    });
  }

  handleAddForm = () => {
    const { form, addFieldToCollection, changeField } = this.props;

    if (this.state.formType.indexOf('info') >= 0) {
      return changeField(form, this.state.formType, '');
    }

    return addFieldToCollection(form, `${this.state.formType}`, {});
  }

  render() {
    const { __ } = this.props;
    // FIXME: an autofilled field is removed on blur or change to empty https://github.com/erikras/redux-form/issues/3366
    // const { formValues: { info }, __ } = this.props;
    // const hasBirthday = info && info.birthday && info.birthday.length > 0;

    const typeOptions = [
      {
        label: __('contact.form-selector.email_form.label'),
        value: 'emails',
      },
      {
        label: __('contact.form-selector.phone_form.label'),
        value: 'phones',
      },
      {
        label: __('contact.form-selector.im_form.label'),
        value: 'ims',
      },
      {
        label: __('contact.form-selector.address_form.label'),
        value: 'addresses',
      },
      // ...(hasBirthday ? [] : [{
      //   label: __('contact.form-selector.birthday_form.label'),
      //   value: 'info.birthday',
      // }]),
    ];

    if (!typeOptions.length) {
      return null;
    }

    return (
      <TextList className="m-add-form-field-form">
        <ItemContent>
          <FormGrid>
            <FormRow>
              <FormColumn size="shrink">
                <Legend>
                  <Icon type="crosshairs" rightSpaced />
                  <span className="m-add-form-field-form__legend">
                    {__('contact.form-selector.add_new_field.label')}
                  </span>
                </Legend>
              </FormColumn>
              <FormColumn size="shrink" fluid bottomSpace>
                <SelectFieldGroup
                  name="selectedForm"
                  onChange={this.handleSelectChange}
                  value={this.state.formType}
                  options={typeOptions}
                  showLabelforSr
                  label={__('contact.form-selector.add_new_field.label')}
                />
              </FormColumn>
              <FormColumn size="shrink" className="m-add-form-field-form__col-button">
                <Button icon="plus" shape="plain" onClick={this.handleAddForm}>
                  {__('contact.action.add_new_field')}
                </Button>
              </FormColumn>
            </FormRow>
          </FormGrid>
        </ItemContent>
      </TextList>
    );
  }
}

export default AddFormFieldForm;
