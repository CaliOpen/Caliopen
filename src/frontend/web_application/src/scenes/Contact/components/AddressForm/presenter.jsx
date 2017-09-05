import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CountryDropdown as CountryDropdownBase, RegionDropdown as RegionDropdownBase } from 'react-country-region-selector';
import { Field } from 'redux-form';
import renderReduxField from '../../services/renderReduxField';
import Icon from '../../../../components/Icon';
import Button from '../../../../components/Button';
import { FieldErrors, Fieldset, Legend, TextFieldGroup as TextFieldGroupBase, SelectFieldGroup as SelectFieldGroupBase, FormGrid, FormRow, FormColumn } from '../../../../components/form';
import './style.scss';

const ADDRESS_TYPES = ['work', 'home', 'other'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);
const CountryDropdown = renderReduxField(CountryDropdownBase);
const RegionDropdown = renderReduxField(RegionDropdownBase);

class AddressForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    __: PropTypes.func.isRequired,
    country: PropTypes.string,
  };

  static defaultProps = {
    errors: [],
    country: undefined,
  };

  componentWillMount() {
    this.initTranslations();
  }

  initTranslations() {
    const { __ } = this.props;
    this.addressTypes = {
      work: __('contact.address_type.work'),
      home: __('contact.address_type.home'),
      other: __('contact.address_type.other'),
    };
  }

  render() {
    const { __, errors = [], onDelete, country } = this.props;
    const addressTypeOptions = ADDRESS_TYPES.map(value => ({
      value,
      label: this.addressTypes[value],
    }));

    return (
      <FormGrid className="m-address-form">
        <Fieldset>
          <FormRow>
            <FormColumn>
              <Legend>
                <Icon rightSpaced type="map-marker" />
                {__('contact.address_form.legend')}
              </Legend>
            </FormColumn>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
          </FormRow>
          <FormRow>
            <FormColumn bottomSpace>
              <Field
                component={TextFieldGroup}
                name="street"
                label={__('contact.address_form.street.label')}
                placeholder={__('contact.address_form.street.label')}
                showLabelforSr
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="small" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="postal_code"
                label={__('contact.address_form.postal_code.label')}
                placeholder={__('contact.address_form.postal_code.label')}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn size="large" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="city"
                label={__('contact.address_form.city.label')}
                placeholder={__('contact.address_form.city.label')}
                showLabelforSr
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="medium" bottomSpace>
              {
                // TODO: insert select-wrapper to fit SelectFieldGroup architecture
              }
              <label className="show-for-sr" htmlFor="contact-adress-country">
                {__('contact.address_form.country.label')}
              </label>
              <Field
                component={CountryDropdown}
                id="contact-adress-country"
                name="country"
                classes="m-address-form__select"
                defaultOptionLabel={__('contact.address_form.select_country')}
              />
            </FormColumn>
            <FormColumn size="medium" bottomSpace>
              {
                // TODO: insert select-wrapper to fit SelectFieldGroup architecture
              }
              <label className="show-for-sr" htmlFor="contact-adress-region">
                {__('contact.address_form.region.label')}
              </label>
              <Field
                component={RegionDropdown}
                id="contact-adress-region"
                name="region"
                classes="m-address-form__select"
                defaultOptionLabel={__('contact.address_form.select_region')}
                country={country}
              />
            </FormColumn>
            <FormColumn size="shrink" bottomSpace fluid>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={__('contact.address_form.type.label')}
                options={addressTypeOptions}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn size="shrink" className="m-address-form__col-button">
              <Button color="alert" icon="remove" onClick={onDelete} />
            </FormColumn>
          </FormRow>
        </Fieldset>
      </FormGrid>
    );
  }
}

export default AddressForm;
