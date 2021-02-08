import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  SelectFieldGroup as SelectFieldGroupBase,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import renderReduxField from '../../../../services/renderReduxField';

const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);
const DISPLAY_FORMAT = ['given_name, family_name', 'family_name, given_name'];
const DISPLAY_ORDER_BY = ['given_name', 'family_name'];

class ContactsForm extends Component {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static defaultProps = {};

  UNSAFE_componentWillMount() {
    this.initTranslations();
  }

  getOptionsFromArray = (options) =>
    options.map((value) => ({
      value,
      label: this.i18n[value] || value,
    }));

  initTranslations() {
    const { i18n } = this.props;
    this.i18n = {
      'given_name, family_name': i18n._(
        'settings.contact.display_format.options.first_last',
        null,
        { defaults: 'Firstname, Lastname' }
      ),
      'family_name, given_name': i18n._(
        'settings.contact.display_format.options.last_first',
        null,
        { defaults: 'Lastname, Firstname' }
      ),
      given_name: i18n._(
        'settings.contact.display_order_by.options.firstname',
        null,
        { defaults: 'Firstname' }
      ),
      family_name: i18n._(
        'settings.contact.display_order_by.options.lastname',
        null,
        { defaults: 'Lastname' }
      ),
    };
  }

  render() {
    const { i18n } = this.props;

    const displayFormatOptions = this.getOptionsFromArray(DISPLAY_FORMAT);
    const displayOrderByOptions = this.getOptionsFromArray(DISPLAY_ORDER_BY);

    return (
      <FormGrid className="m-contacts-form">
        <FormRow>
          <FormColumn rightSpace={false} bottomSpace>
            <Field
              component={SelectFieldGroup}
              name="contact_display_format"
              label={i18n._('settings.contacts.display.label', null, {
                defaults: 'Display',
              })}
              options={displayFormatOptions}
              expanded
            />
          </FormColumn>
          <FormColumn rightSpace={false}>
            <Field
              component={SelectFieldGroup}
              name="contact_display_order"
              label={i18n._('settings.contacts.order.label', null, {
                defaults: 'Order by',
              })}
              options={displayOrderByOptions}
              expanded
            />
          </FormColumn>
        </FormRow>
      </FormGrid>
    );
  }
}

export default ContactsForm;
