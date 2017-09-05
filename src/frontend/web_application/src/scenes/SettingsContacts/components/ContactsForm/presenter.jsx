import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/Button';
import { FormGrid, FormRow, FormColumn, SelectFieldGroup, FieldErrors } from '../../../../components/form';

// FIXME: i18n the following:
const DISPLAY_CONTACTS = ['Firstname, Lastname', 'Lastname, Firstname'];
const ORDER_CONTACTS = ['Lastname', 'Firstname'];
const CONTACT_FORMATS = ['Firstname only', 'Lastname only', 'Lastname and Firstname'];
const ADRESS_FORMATS = ['French', 'US'];
const PHONE_FORMATS = ['+33.XXXXXXXXXX', 'XXXXXXXXXX'];
const VCARD_FORMATS = ['2.1', '3.0', '4.0'];
const VCARD_ENCODING = ['Occidental', 'Oriental'];

function generateStateFromProps(props, prevState) {
  return {
    settings: {
      ...prevState.settings,
      ...props.settings,
    },
  };
}

class ContactsForm extends Component {
  static propTypes = {
    errors: PropTypes.shape({}),
    onSubmit: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
  };
  static defaultProps = {
    errors: {},
  };

  state = {
    settings: {
      display: '',
      order: '',
      contact_format: '',
      adress_format: '',
      phone_format: '',
      vcard_format: '',
      vcard_encoding: '',
    },
  };

  componentWillMount() {
    this.setState(prevState => generateStateFromProps(this.props, prevState));
  }

  componentWillReceiveProps(newProps) {
    this.setState(prevState => generateStateFromProps(newProps, prevState));
  }

  getOptionsFromArray = (options) => {
    const selectedOptions = options.map(value => ({
      value,
      label: value,
    }));

    return selectedOptions;
  }

  handleSubmit = () => {
    const { settings } = this.state;
    this.props.onSubmit({ settings });
  }

  handleInputChange = (ev) => {
    const { name, value } = ev.target;

    this.setState(prevState => ({
      settings: {
        ...prevState.settings,
        [name]: value,
      },
    }));
  }

  render() {
    const { errors, __ } = this.props;

    const displayOptions = this.getOptionsFromArray(DISPLAY_CONTACTS);
    const orderOptions = this.getOptionsFromArray(ORDER_CONTACTS);
    const contactFormatOptions = this.getOptionsFromArray(CONTACT_FORMATS);
    const adressFormatOptions = this.getOptionsFromArray(ADRESS_FORMATS);
    const phoneFormatOptions = this.getOptionsFromArray(PHONE_FORMATS);
    const vcardFormatOptions = this.getOptionsFromArray(VCARD_FORMATS);
    const vcardEncodingOptions = this.getOptionsFromArray(VCARD_ENCODING);


    return (
      <FormGrid className="m-contacts-form">
        <form method="post" name="contacts_form">
          {errors.global && errors.global.length !== 0 && (
          <FormRow>
            <FormColumn bottomSpace>
              <FieldErrors errors={errors.global} />
            </FormColumn>
          </FormRow>
          )}
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="display"
                value={this.state.settings.display}
                onChange={this.handleInputChange}
                label={__('settings.contacts.display.label')}
                options={displayOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="order"
                value={this.state.settings.order}
                onChange={this.handleInputChange}
                label={__('settings.contacts.order.label')}
                options={orderOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace>
              <SelectFieldGroup
                name="contact_format"
                value={this.state.settings.contact_format}
                onChange={this.handleInputChange}
                label={__('settings.contacts.contact_format.label')}
                options={contactFormatOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="adress_format"
                value={this.state.settings.adress_format}
                onChange={this.handleInputChange}
                label={__('settings.contacts.adress_format.label')}
                options={adressFormatOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="phone_format"
                value={this.state.settings.phone_format}
                onChange={this.handleInputChange}
                label={__('settings.contacts.phone_format.label')}
                options={phoneFormatOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="vcard_format"
                value={this.state.settings.vcard_format}
                onChange={this.handleInputChange}
                label={__('settings.contacts.vcard_format.label')}
                options={vcardFormatOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" bottomSpace >
              <SelectFieldGroup
                name="vcard_encoding"
                value={this.state.settings.vcard_encoding}
                onChange={this.handleInputChange}
                label={__('settings.contacts.vcard_encoding.label')}
                options={vcardEncodingOptions}
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="shrink" className="m-contacts-form__action" bottomSpace>
              <Button
                type="submit"
                onClick={this.handleSubmit}
                shape="plain"
              >{__('settings.contacts.update.action')}</Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }
}

export default ContactsForm;
