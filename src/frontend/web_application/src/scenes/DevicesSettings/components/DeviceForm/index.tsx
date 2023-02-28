import * as React from 'react';
import { Trans, useLingui } from '@lingui/react';
import { Device } from 'src/modules/device/types';
import {
  Button,
  FormGrid,
  FormRow,
  FormColumn,
  TextFieldGroup,
  SelectFieldGroup,
} from 'src/components';
import './style.scss';
import { saveDevice } from 'src/modules/device';
import { useDispatch } from 'react-redux';
import { notifyError, notifySuccess } from 'src/modules/userNotify';

interface Props {
  device: Device;
}
function DeviceForm({ device }: Props) {
  const dispatch = useDispatch();
  const { i18n } = useLingui();
  const [formData, setFormData] = React.useState({
    name: device.name,
    type: device.type,
  });

  const handleFieldChange = (ev) => {
    const { name, value } = ev.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleLocationsChange = (locations) => {
  //   this.setState(prevState => ({
  //     device: {
  //       ...prevState.device,
  //       locations,
  //     },
  //   }));
  // }

  // validateIP = (ip) => {
  //   // XXX: add IP V6 support
  //   if (/^[0-9]{1,3}(\.[-/0-9]*){1,3}$/.test(ip)) {
  //     return { isValid: true };
  //   }
  //
  //   const { i18n } = this.props;
  //
  //   return { isValid: false, errors: [i18n._(/* i18n */ 'device.feedback.invalid_ip', null, { message: 'IP
  //   or subnet address is invalid.' })] };
  // }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(
        saveDevice({
          device: {
            ...device,
            ...formData,
          },
          original: device,
        })
      );
      dispatch(
        notifySuccess({
          message: (
            <Trans
              id="device.feedback.save_success"
              message="The device has been saved"
            />
          ),
        })
      );
    } catch (errors) {
      errors.forEach(({ message }) => dispatch(notifyError({ message })));
    }
  };

  const deviceTypes = [
    {
      value: 'desktop',
      label: i18n._(/* i18n */ 'device.type.desktop', undefined, {
        message: 'Desktop',
      }),
    },
    {
      value: 'laptop',
      label: i18n._(/* i18n */ 'device.type.laptop', undefined, {
        message: 'Laptop',
      }),
    },
    {
      value: 'smartphone',
      label: i18n._(/* i18n */ 'device.type.smartphone', undefined, {
        message: 'Smartphone',
      }),
    },
    {
      value: 'tablet',
      label: i18n._(/* i18n */ 'device.type.tablet', undefined, {
        message: 'Tablet',
      }),
    },
    {
      value: 'other',
      label: i18n._(/* i18n */ 'device.type.other', undefined, {
        message: 'Other',
      }),
    },
  ];
  // const locationTypes = [
  //   { label: i18n._(/* i18n */ 'device.location.type.unknown', undefined, { message: 'Unknown' }), value:
  //   'unknown' },
  //   { label: i18n._(/* i18n */ 'device.location.type.home', undefined, { message: 'Home' }), value: 'home' },
  //   { label: i18n._(/* i18n */ 'device.location.type.work', undefined, { message: 'Work' }), value: 'work' },
  //   { label: i18n._(/* i18n */ 'device.location.type.public', undefined, { message: 'Public' }), value:
  //   'public' },
  // ];
  // const defaultLocation = { address: '', type: locationTypes[0].value };
  //
  // const locationTemplate = ({ item: location, onChange, className }) => {
  //   const handleChange = (ev) => {
  //     const { name, value } = ev.target;
  //     onChange({
  //       item: {
  //         ...location,
  //         [name]: value,
  //       },
  //     });
  //   };
  //
  //   return (
  //     <div className={classnames('m-device-form__location-group', className)}>
  //       <TextFieldGroup
  //         showLabelforSr
  //         name="address"
  //         label={i18n._(/* i18n */ 'device.form.locations.address.label', null, { message: 'IP or subnet
  //         mask' })}
  //         value={location.address}
  //         onChange={handleChange}
  //         className="m-device-form__location-address"
  //       />
  //       <SelectFieldGroup
  //         showLabelforSr
  //         name="type"
  //         label={i18n._(/* i18n */ 'device.form.locations.type.label', null, { message: 'Connection
  //         location' })}
  //         value={location.type}
  //         options={locationTypes}
  //         onChange={handleChange}
  //         className="m-device-form__location-type"
  //       />
  //     </div>
  //   );
  // };

  return (
    <FormGrid className="m-device-form">
      <form method="post" onSubmit={handleSubmit}>
        <FormRow>
          <FormColumn bottomSpace rightSpace={false}>
            <TextFieldGroup
              label={i18n._(
                /* i18n */ 'device.manage_form.name.label',
                undefined,
                {
                  message: 'Name:',
                }
              )}
              id="device-name"
              inputProps={{
                name: 'name',
                value: formData.name,
                onChange: handleFieldChange,
              }}
            />
          </FormColumn>
          {
            // XXX: hidden for now, backend does not save it and it is not used anywere
            // we need a specification for this feature https://trello.com/c/j5iKNg7x/192-securisation-des-devices-par-ip-de-connexion
            //   <FormColumn bottomSpace rightSpace={false}>
            //   <Label htmlFor="device-ips" className="m-device-form__label">
            //     <Trans id="device.manage_form.ips.infotext">Restrict the access of your account
            //     to certain IP addresses for this device. (e.g. 192.168.10 or 192.168.1.1/24 or
            //     192.168.1.1-20)</Trans>
            //   </Label>
            //   <CollectionFieldGroup
            //     defaultValue={defaultLocation}
            //     collection={this.state.device.locations}
            //     addTemplate={locationTemplate}
            //     editTemplate={locationTemplate}
            //     onChange={this.handleLocationsChange}
            //   />
            // </FormColumn>
          }
        </FormRow>
        <FormRow>
          <FormColumn rightSpace={false} bottomSpace>
            <SelectFieldGroup
              className="m-device-form__type"
              label={i18n._(
                /* i18n */ 'device.manage_form.type.label',
                undefined,
                {
                  message: 'Type:',
                }
              )}
              name="type"
              id="device-type"
              value={formData.type}
              options={deviceTypes}
              onChange={handleFieldChange}
              expanded
            />
          </FormColumn>
        </FormRow>
        <FormRow>
          <FormColumn>
            <Button shape="plain" type="submit">
              <Trans
                id="device.action.save_changes"
                message="Save modifications"
              />
            </Button>
          </FormColumn>
        </FormRow>
      </form>
    </FormGrid>
  );
}

export default DeviceForm;
