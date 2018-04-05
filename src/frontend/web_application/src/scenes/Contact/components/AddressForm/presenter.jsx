import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'lingui-react';
import { CountryDropdown as CountryDropdownBase, RegionDropdown as RegionDropdownBase } from 'react-country-region-selector';
import { Field } from 'redux-form';
import renderReduxField from '../../../../services/renderReduxField';
import { Button, Icon, FieldErrors, SelectFieldGroup as SelectFieldGroupBase, TextFieldGroup as TextFieldGroupBase, Fieldset, Legend, FormGrid, FormRow, FormColumn } from '../../../../components';
import './style.scss';

const ADDRESS_TYPES = ['', 'work', 'home', 'other'];
const TextFieldGroup = renderReduxField(TextFieldGroupBase);
const SelectFieldGroup = renderReduxField(SelectFieldGroupBase);
const CountryDropdown = renderReduxField(CountryDropdownBase);
const RegionDropdown = renderReduxField(RegionDropdownBase);

class AddressForm extends PureComponent {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
    i18n: PropTypes.shape({}).isRequired,
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
    const { i18n } = this.props;
    this.addressTypes = {
      work: i18n._('contact.address_type.work', { defaults: 'Professional' }),
      home: i18n._('contact.address_type.home', { defaults: 'Personal' }),
      other: i18n._('contact.address_type.other', { defaults: 'Other' }),
    };
  }

  render() {
    const {
      i18n, errors = [], onDelete, country,
    } = this.props;
    const addressTypeOptions = ADDRESS_TYPES.map(value => ({
      value,
      label: this.addressTypes[value] || '',
    }));

    return (
      <FormGrid className="m-address-form">
        <Fieldset>
          <FormRow>
            <FormColumn>
              <Legend>
                <Icon rightSpaced type="map-marker" />
                <Trans id="contact.address_form.legend">Postal address</Trans>
              </Legend>
            </FormColumn>
            {errors.length > 0 && (<FormColumn><FieldErrors errors={errors} /></FormColumn>)}
          </FormRow>
          <FormRow>
            <FormColumn bottomSpace>
              <Field
                component={TextFieldGroup}
                name="street"
                label={i18n._('contact.address_form.street.label', { defaults: 'Street' })}
                placeholder={i18n._('contact.address_form.street.label', { defaults: 'Street' })}
                showLabelforSr
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn size="small" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="postal_code"
                label={i18n._('contact.address_form.postal_code.label', { defaults: 'Postal Code' })}
                placeholder={i18n._('contact.address_form.postal_code.label', { defaults: 'Postal Code' })}
                showLabelforSr
              />
            </FormColumn>
            <FormColumn size="large" bottomSpace>
              <Field
                component={TextFieldGroup}
                name="city"
                label={i18n._('contact.address_form.city.label', { defaults: 'City' })}
                placeholder={i18n._('contact.address_form.city.label', { defaults: 'City' })}
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
                <Trans id="contact.address_form.country.label">Country</Trans>
              </label>
              <Field
                component={CountryDropdown}
                id="contact-adress-country"
                name="country"
                classes="m-address-form__select"
                defaultOptionLabel={i18n._('contact.address_form.select_country', { defaults: 'Country' })}
              />
            </FormColumn>
            <FormColumn size="medium" bottomSpace>
              {
                // TODO: insert select-wrapper to fit SelectFieldGroup architecture
              }
              <label className="show-for-sr" htmlFor="contact-adress-region">
                <Trans id="contact.address_form.region.label">Region</Trans>
              </label>
              <Field
                component={RegionDropdown}
                id="contact-adress-region"
                name="region"
                classes="m-address-form__select"
                defaultOptionLabel={i18n._('contact.address_form.select_region', { defaults: 'Region' })}
                country={country}
              />
            </FormColumn>
            <FormColumn size="shrink" bottomSpace fluid>
              <Field
                component={SelectFieldGroup}
                name="type"
                label={i18n._('contact.address_form.type.label', { defaults: 'Type' })}
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
