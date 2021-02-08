import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/react';
// import classnames from 'classnames';
import {
  Button,
  FormGrid,
  FormRow,
  FormColumn,
  TextFieldGroup,
  SelectFieldGroup,
} from '../../../../components';
import './style.scss';

class DeviceForm extends Component {
  static propTypes = {
    device: PropTypes.shape({}).isRequired,
    onChange: PropTypes.func.isRequired,
    notifyError: PropTypes.func.isRequired,
    notifySuccess: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  static initialState = {
    initialized: false,
    device: {
      name: '',
      type: '',
      // locations: [],
    },
  };

  static generateStateFromProps(props, prevState) {
    const { isFetching, device } = props;

    return {
      ...prevState,
      initialized: !isFetching && device,
      device,
    };
  }

  state = this.constructor.generateStateFromProps(
    this.props,
    this.constructor.initialState
  );

  componentDidUpdate(prevProps) {
    const propNames = ['device'];
    const hasChanged = propNames.some(
      (propName) => this.props[propName] !== prevProps[propName]
    );

    if (!this.state.initialized && hasChanged) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((prevState) =>
        this.constructor.generateStateFromProps(this.props, prevState)
      );
    }
  }

  handleFieldChange = (ev) => {
    const { name, value } = ev.target;
    this.setState((prevState) => ({
      device: {
        ...prevState.device,
        [name]: value,
      },
    }));
  };

  // handleLocationsChange = (locations) => {
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
  //   return { isValid: false, errors: [i18n._('device.feedback.invalid_ip', null, { defaults: 'IP
  //   or subnet address is invalid.' })] };
  // }

  handleSubmit = async (event) => {
    const { onChange, notifyError, notifySuccess } = this.props;
    event.preventDefault();
    try {
      await onChange({
        device: this.state.device,
        original: this.props.device,
      });
      notifySuccess({
        message: (
          <Trans id="device.feedback.save_success">
            The device has been saved
          </Trans>
        ),
      });
    } catch (errors) {
      errors.forEach(({ message }) => notifyError({ message }));
    }
  };

  render() {
    const { i18n } = this.props;
    const deviceTypes = [
      {
        value: 'desktop',
        label: i18n._('device.type.desktop', null, { defaults: 'Desktop' }),
      },
      {
        value: 'laptop',
        label: i18n._('device.type.laptop', null, { defaults: 'Laptop' }),
      },
      {
        value: 'smartphone',
        label: i18n._('device.type.smartphone', null, {
          defaults: 'Smartphone',
        }),
      },
      {
        value: 'tablet',
        label: i18n._('device.type.tablet', null, { defaults: 'Tablet' }),
      },
      {
        value: 'other',
        label: i18n._('device.type.other', null, { defaults: 'Other' }),
      },
    ];
    // const locationTypes = [
    //   { label: i18n._('device.location.type.unknown', null, { defaults: 'Unknown' }), value:
    //   'unknown' },
    //   { label: i18n._('device.location.type.home', null, { defaults: 'Home' }), value: 'home' },
    //   { label: i18n._('device.location.type.work', null, { defaults: 'Work' }), value: 'work' },
    //   { label: i18n._('device.location.type.public', null, { defaults: 'Public' }), value:
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
    //         label={i18n._('device.form.locations.address.label', null, { defaults: 'IP or subnet
    //         mask' })}
    //         value={location.address}
    //         onChange={handleChange}
    //         className="m-device-form__location-address"
    //       />
    //       <SelectFieldGroup
    //         showLabelforSr
    //         name="type"
    //         label={i18n._('device.form.locations.type.label', null, { defaults: 'Connection
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
        <form method="post" onSubmit={this.handleSubmit}>
          <FormRow>
            <FormColumn bottomSpace rightSpace={false}>
              <TextFieldGroup
                label={i18n._('device.manage_form.name.label', null, {
                  defaults: 'Name:',
                })}
                name="name"
                id="device-name"
                value={this.state.device.name}
                onChange={this.handleFieldChange}
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
                label={i18n._('device.manage_form.type.label', null, {
                  defaults: 'Type:',
                })}
                name="type"
                id="device-type"
                value={this.state.device.type}
                options={deviceTypes}
                onChange={this.handleFieldChange}
                expanded
              />
            </FormColumn>
          </FormRow>
          <FormRow>
            <FormColumn>
              <Button shape="plain" type="submit">
                <Trans id="device.action.save_changes">
                  Save modifications
                </Trans>
              </Button>
            </FormColumn>
          </FormRow>
        </form>
      </FormGrid>
    );
  }
}

export default DeviceForm;
