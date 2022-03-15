import * as React from 'react';
import { Trans, useLingui } from '@lingui/react';
import {
  CountryDropdown,
  CountryDropdownProps,
  RegionDropdown,
  RegionDropdownProps,
} from 'react-country-region-selector';
import { Field, FieldProps, getIn, useFormikContext } from 'formik';
import { FormikSelectFieldGroup } from 'src/components/SelectFieldGroup';
import { FormikTextFieldGroup } from 'src/components/TextFieldGroup';
import { ContactPayload } from 'src/modules/contact/types';
import {
  Button,
  Icon,
  Fieldset,
  Legend,
  FormGrid,
  FormRow,
  FormColumn,
} from 'src/components';
import { validateRequired } from 'src/modules/form/services/validators';
import './style.scss';
import { ItemProps } from '../FormCollection';

const ADDRESS_TYPES = ['', 'work', 'home', 'other'];

type CountryFieldProps = FieldProps & CountryDropdownProps;

function CountryField({
  id,
  form,
  field,
  meta,
  ...props
}: CountryFieldProps): React.ReactElement<CountryDropdownProps> {
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
}

type RegionFieldProps = FieldProps<
  NonNullable<ContactPayload['addresses']>[number]['region']
> &
  RegionDropdownProps & { countryFieldName: string };
function RegionField({
  countryFieldName,
  id,
  form,
  field,
  meta,
  ...props
}: RegionFieldProps): React.ReactElement<RegionDropdownProps> {
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
}

function AddressForm({
  onDelete,
  name,
}: ItemProps): React.ReactElement<typeof FormGrid> {
  const { i18n } = useLingui();
  const { values } = useFormikContext<ContactPayload>();
  const country = values[`${name}.country`];

  const addressTypes = {
    work: i18n._(/* i18n */ 'contact.address_type.work', undefined, {
      message: 'Professional',
    }),
    home: i18n._(/* i18n */ 'contact.address_type.home', undefined, {
      message: 'Personal',
    }),
    other: i18n._(/* i18n */ 'contact.address_type.other', undefined, {
      message: 'Other',
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
              <Trans
                id="contact.address_form.legend"
                message="Postal address"
              />
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
              label={i18n._(
                /* i18n */ 'contact.address_form.street.label',
                undefined,
                {
                  message: 'Street',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */
                  'contact.address_form.street.label',
                  undefined,
                  {
                    message: 'Street',
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
                /* i18n */ 'contact.address_form.postal_code.label',
                undefined,
                {
                  message: 'Postal Code',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */
                  'contact.address_form.postal_code.label',
                  undefined,
                  { message: 'Postal Code' }
                ),
                expanded: true,
              }}
              showLabelforSr
            />
          </FormColumn>
          <FormColumn size="large" bottomSpace>
            <Field
              component={FormikTextFieldGroup}
              validate={validateRequired(i18n)}
              name={`${name}.city`}
              label={i18n._(
                /* i18n */ 'contact.address_form.city.label',
                undefined,
                {
                  message: 'City',
                }
              )}
              inputProps={{
                placeholder: i18n._(
                  /* i18n */
                  'contact.address_form.city.label',
                  undefined,
                  {
                    message: 'City',
                  }
                ),
                expanded: true,
                required: true,
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
              <Trans
                id="contact.address_form.country.label"
                message="Country"
              />
            </label>
            <Field
              component={CountryField}
              id="contact-adress-country"
              name={`${name}.country`}
              classes="m-address-form__select"
              defaultOptionLabel={i18n._(
                /* i18n */ 'contact.address_form.select_country',
                undefined,
                { message: 'Country' }
              )}
            />
          </FormColumn>
          <FormColumn size="medium" bottomSpace>
            {
              // TODO: insert select-wrapper to fit SelectFieldGroup architecture
            }
            <label className="show-for-sr" htmlFor="contact-adress-region">
              <Trans id="contact.address_form.region.label" message="Region" />
            </label>
            <Field
              component={RegionField}
              id="contact-adress-region"
              countryFieldName={`${name}.country`}
              name={`${name}.region`}
              classes="m-address-form__select"
              defaultOptionLabel={i18n._(
                /* i18n */ 'contact.address_form.select_region',
                undefined,
                { message: 'Region' }
              )}
              country={country}
            />
          </FormColumn>
          <FormColumn size="shrink" bottomSpace fluid>
            <Field
              component={FormikSelectFieldGroup}
              name={`${name}.type`}
              label={i18n._(
                /* i18n */ 'contact.address_form.type.label',
                undefined,
                {
                  message: 'Type',
                }
              )}
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

export default AddressForm;
