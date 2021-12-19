import * as React from 'react';
import { Trans, withI18n, withI18nProps } from '@lingui/react';
import {
  CountryDropdown,
  CountryDropdownProps,
  RegionDropdown,
  RegionDropdownProps,
} from 'react-country-region-selector';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { FormikSelectFieldGroup } from 'src/components/SelectFieldGroup';
import { FormikTextFieldGroup } from 'src/components/TextFieldGroup';
import { ContactCommon, ContactPayload } from 'src/modules/contact/types';
import {
  Button,
  Icon,
  FieldErrors,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from '../../../../components';
import './style.scss';
import { ItemProps } from '../FormCollection';

const ADDRESS_TYPES = ['', 'work', 'home', 'other'];

type CountryFieldProps = FieldProps & CountryDropdownProps;

const CountryField = ({
  id,
  form,
  field,
  meta,
  ...props
}: CountryFieldProps): React.ReactElement<CountryDropdownProps> => {
  const onChange = (val, evt) => field.onChange(evt);

  return (
    <CountryDropdown
      id={id}
      {...field}
      {...props}
      // @ts-ignore: not typed in CountryDropdown but 2nd param is the native event
      onChange={onChange}
    />
  );
};

type RegionFieldProps = FieldProps<
  NonNullable<ContactPayload['addresses']>[number]['region']
> &
  RegionDropdownProps & { countryFieldName: string };
const RegionField = ({
  countryFieldName,
  id,
  form,
  field,
  meta,
  ...props
}: RegionFieldProps): React.ReactElement<RegionDropdownProps> => {
  const { values } = useFormikContext<ContactPayload>();
  const country: string = getIn(values, countryFieldName);

  const { onBlur } = field;
  const onChange = (val, evt) => field.onChange(evt);

  return (
    // @ts-ignore cf. below
    <RegionDropdown
      id={id}
      {...field}
      {...props}
      country={country}
      // @ts-ignore: bad type in RegionDropdown
      onBlur={onBlur}
      // @ts-ignore: not typed in CountryDropdown but 2nd param is the native event
      onChange={onChange}
    />
  );
};

function AddressForm({ onDelete, name, i18n }: ItemProps & withI18nProps) {
  const { values } = useFormikContext<ContactCommon>();
  const country = values[`${name}.country`];

  const addressTypes = {
    work: i18n._('contact.address_type.work', undefined, {
      defaults: 'Professional',
    }),
    home: i18n._('contact.address_type.home', undefined, {
      defaults: 'Personal',
    }),
    other: i18n._('contact.address_type.other', undefined, {
      defaults: 'Other',
    }),
  };

  const addressTypeOptions = ADDRESS_TYPES.map((value) => ({
    value,
    label: addressTypes[value] || '',
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
          {/* {errors.length > 0 && (
              <FormColumn>
                <FieldErrors errors={errors} />
              </FormColumn>
            )} */}
        </FormRow>
        <FormRow>
          <FormColumn bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.street`}
              label={i18n._('contact.address_form.street.label', undefined, {
                defaults: 'Street',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact.address_form.street.label',
                  undefined,
                  {
                    defaults: 'Street',
                  }
                ),
                expanded: true,
              }}
              showLabelforSr
            />
          </FormColumn>
        </FormRow>
        <FormRow>
          <FormColumn size="small" bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.postal_code`}
              label={i18n._(
                'contact.address_form.postal_code.label',
                undefined,
                {
                  defaults: 'Postal Code',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  'contact.address_form.postal_code.label',
                  undefined,
                  { defaults: 'Postal Code' }
                ),
                expanded: true,
              }}
              showLabelforSr
            />
          </FormColumn>
          <FormColumn size="large" bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              name={`${name}.city`}
              label={i18n._('contact.address_form.city.label', undefined, {
                defaults: 'City',
              })}
              inputProps={{
                placeholder: i18n._(
                  'contact.address_form.city.label',
                  undefined,
                  {
                    defaults: 'City',
                  }
                ),
                expanded: true,
              }}
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
              component={CountryField}
              id="contact-adress-country"
              name={`${name}.country`}
              classes="m-address-form__select"
              defaultOptionLabel={i18n._(
                'contact.address_form.select_country',
                undefined,
                { defaults: 'Country' }
              )}
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
              component={RegionField}
              id="contact-adress-region"
              countryFieldName={`${name}.country`}
              name={`${name}.region`}
              classes="m-address-form__select"
              defaultOptionLabel={i18n._(
                'contact.address_form.select_region',
                undefined,
                { defaults: 'Region' }
              )}
              country={country}
            />
          </FormColumn>
          <FormColumn size="shrink" bottomSpace fluid>
            <Field
              component={FormikSelectFieldGroup}
              name={`${name}.type`}
              label={i18n._('contact.address_form.type.label', undefined, {
                defaults: 'Type',
              })}
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

export default withI18n()(AddressForm);
